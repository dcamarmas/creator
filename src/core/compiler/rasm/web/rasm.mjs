import { RasmModule } from "./wasm/rasm.js";
import { main_memory } from "../../../core.mjs";
import { precomputeInstructions, formatErrorWithColors } from "../../compiler.mjs";
import { parseDebugSymbolsRASM } from "../utils.mjs";

// eslint-disable-next-line max-lines-per-function
export async function assembly_compiler_rasm(code) {
    // Re-initialize WASM module every time
    let rasmModule;
    const result = {
        errorcode: "",
        token: "",
        type: "",
        update: "",
        status: "ko",
        binary: "",
    };
    try {
        // Arrays to capture stdout and stderr
        const capturedStdout = [];
        const capturedStderr = [];

        // Load the rasm WebAssembly module
        rasmModule = await RasmModule({
            locateFile: (file) => {
                return new URL(`./wasm/${file}`, import.meta.url).href;
            },
            print: (text) => {
                capturedStdout.push(text);
                console.log(text); // Still log to console for debugging
            },
            printErr: (text) => {
                capturedStderr.push(text);
                console.error(text); // Still log to console for debugging
            }
        });

        if (!rasmModule.FS) {
            throw new Error("File system not available in WebAssembly module");
        }

        // Always use fixed filenames
        const filename = "program";
        const asmFilename = filename + ".asm";
        const binFilename = filename + ".bin";
        const symFilename = filename + ".sym";

        // Write source as-is
        rasmModule.FS.writeFile(asmFilename, code);

        console.log("Assembly source written to:", asmFilename);

        // check if the file exists
        if (!rasmModule.FS.analyzePath(asmFilename).exists) {
            console.error("Assembly source file not found:", asmFilename);
            result.status = "ko";
            result.update = "Assembly source file not found: " + asmFilename;
            return result;
        }

        // Call the main function with arguments using callMain
        const args = [asmFilename, '-sp', '-os', symFilename, '-ob', binFilename];

        // Call main function using Emscripten's callMain
        const exitCode = rasmModule.callMain(args);

        // Check for errors
        if (exitCode !== 0) {
            console.error("Assembly failed with exit code:", exitCode);
            // remove the first 7 lines from capturedStdout, which contain the program header
            const errorLines = capturedStdout.join('\n').split('\n').slice(7).join('\n');

            result.msg = formatErrorWithColors(errorLines);
            result.type = "error";
            result.bgcolor = "danger";
            result.status = "error";
            return result;
        }

        if (!rasmModule.FS.analyzePath(binFilename).exists) {
            console.error("Expected output file not found:", binFilename);
            result.msg = "No binary file generated";
            result.type = "error";
            result.bgcolor = "danger";
            result.status = "error";
            return result;
        }

        const binary = rasmModule.FS.readFile(binFilename, { encoding: "binary" });

        // Debug symbols
        let parsedSymbols = null;
        if (rasmModule.FS.analyzePath("./program.sym").exists) {
            const debugSymbols = rasmModule.FS.readFile("./program.sym", { encoding: "utf8" });
            // Parse debug symbols if available
            parsedSymbols = parseDebugSymbolsRASM(debugSymbols);
        } else {
            console.error("Expected symbol file not found:", "./program.sym");
        }

        main_memory.loadROM(binary);
        precomputeInstructions(parsedSymbols);
        
        // Add captured logs to result
        result.stdout = capturedStdout.join('\n');
        result.stderr = capturedStderr.join('\n');
        result.status = "ok";
        

    } catch (error) {
        console.error("Assembly error:", error);
        // Make sure to include any captured logs even on error
        if (typeof capturedStdout !== 'undefined') {
            result.stdout = capturedStdout.join('\n');
        }
        if (typeof capturedStderr !== 'undefined') {
            result.stderr = capturedStderr.join('\n');
        }
    }

    return result;
}
