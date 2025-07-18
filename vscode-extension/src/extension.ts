/* eslint-disable max-lines-per-function */
import * as vscode from "vscode";
import { CreatorDebugSession } from "./creatorDebugSession";
import { CreatorRpcClient } from "./creatorRpcClient";
import { debuggerEvents } from "./debuggerEvents";
import { registerHexViewerCommand } from "./hexViewer";

// Global reference to active hex viewer panel
const activeHexViewerPanel: vscode.WebviewPanel | null = null;

export function activate(context: vscode.ExtensionContext) {
    console.log("CREATOR Assembly Debugger is now active!");

    // Register debug adapter factory
    context.subscriptions.push(
        vscode.debug.registerDebugAdapterDescriptorFactory(
            "creator-assembly",
            new CreatorDebugAdapterFactory(),
        ),
    );

    context.subscriptions.push(
        vscode.debug.onDidStartDebugSession(session => {
            if (session.type === "creator-assembly") {
                // Set the context to true when a debug session of your type starts
                vscode.commands.executeCommand(
                    "setContext",
                    "creator-debugger.active",
                    true,
                );
            }
        }),
    );

    context.subscriptions.push(
        vscode.debug.onDidTerminateDebugSession(session => {
            if (session.type === "creator-assembly") {
                // Set the context to false when the session ends
                vscode.commands.executeCommand(
                    "setContext",
                    "creator-debugger.active",
                    false,
                );
            }
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "creator-debugger.selectArchitecture",
            async () => {
                const fileUri = await vscode.window.showOpenDialog({
                    canSelectFiles: true,
                    canSelectFolders: false,
                    canSelectMany: false,
                    filters: {
                        "Architecture Files": ["yml", "yaml"],
                        "All Files": ["*"],
                    },
                    openLabel: "Select Architecture File",
                    title: "Select CREATOR Architecture File",
                });

                if (fileUri && fileUri[0]) {
                    const architectureFile = fileUri[0].fsPath;
                    const config =
                        vscode.workspace.getConfiguration("creator-debugger");
                    await config.update(
                        "defaultArchitectureFile",
                        architectureFile,
                        vscode.ConfigurationTarget.Global,
                    );
                    vscode.window.showInformationMessage(
                        `Default architecture file set to ${architectureFile}`,
                    );
                }
            },
        ),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "creator-debugger.selectCompiler",
            async () => {
                try {
                    const config =
                        vscode.workspace.getConfiguration("creator-debugger");

                    // Get available compilers
                    const compilerInfo =
                        await CreatorRpcClient.getAvailableCompilers();
                    const compilerItems = compilerInfo.compilers.map(
                        compiler => ({
                            label: compiler.displayName,
                            description: compiler.description,
                            detail:
                                compiler.name === compilerInfo.default
                                    ? "(Default)"
                                    : "",
                            value: compiler.name,
                        }),
                    );

                    const selectedCompiler = await vscode.window.showQuickPick(
                        compilerItems,
                        {
                            placeHolder: "Select a compiler",
                            title: "Choose CREATOR Compiler",
                        },
                    );

                    if (selectedCompiler) {
                        await config.update(
                            "defaultCompiler",
                            selectedCompiler.value,
                            vscode.ConfigurationTarget.Global,
                        );
                        vscode.window.showInformationMessage(
                            `Default compiler set to ${selectedCompiler.label}`,
                        );
                    }
                } catch (error) {
                    vscode.window.showErrorMessage(
                        `Failed to get available compilers: ${
                            error instanceof Error
                                ? error.message
                                : String(error)
                        }`,
                    );
                }
            },
        ),
    );

    debuggerEvents.on("memoryUpdated", memoryDump => {
        if (activeHexViewerPanel) {
            console.log("Received memory update, posting to webview.");
            activeHexViewerPanel.webview.postMessage({
                type: "memoryDump",
                memoryDump,
            });
        }
    });

    registerHexViewerCommand(context);

    // Single start command
    context.subscriptions.push(
        vscode.commands.registerCommand("creator-debugger.start", async () => {
            await startDebugging();
        }),
    );
}

async function startDebugging() {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        vscode.window.showErrorMessage("No active assembly file to debug");
        return;
    }

    const document = activeEditor.document;
    const filePath = document.fileName;

    // Check if it's an assembly file
    if (![".s", ".asm", ".S"].some(ext => filePath.endsWith(ext))) {
        vscode.window.showErrorMessage(
            "Please open an assembly file (.s, .asm, .S)",
        );
        return;
    }

    // Get configuration
    const config = vscode.workspace.getConfiguration("creator-debugger");
    const architectureFile = config.get<string>("defaultArchitectureFile");
    const compiler = config.get<string>("defaultCompiler", "default");
    const rpcServerUrl = config.get<string>(
        "rpcServerUrl",
        "http://localhost:8080",
    );

    // If no architecture file is configured, prompt user to select one
    let selectedArchitectureFile = architectureFile;
    if (!selectedArchitectureFile) {
        const fileUri = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            filters: {
                "Architecture Files": ["yml", "yaml"],
                "All Files": ["*"],
            },
            openLabel: "Select Architecture File",
            title: "Select CREATOR Architecture File for Debugging",
        });

        if (!fileUri || !fileUri[0]) {
            vscode.window.showErrorMessage(
                "No architecture file selected. Cannot start debugging.",
            );
            return;
        }
        selectedArchitectureFile = fileUri[0].fsPath;
    }

    // Start debug session
    const debugConfig = {
        type: "creator-assembly",
        request: "launch",
        name: "Debug Assembly",
        program: filePath,
        architectureFile: selectedArchitectureFile,
        compiler,
        rpcServerUrl,
    };

    vscode.debug.startDebugging(undefined, debugConfig);
}

class CreatorDebugAdapterFactory
    implements vscode.DebugAdapterDescriptorFactory
{
    createDebugAdapterDescriptor(
        session: vscode.DebugSession,
    ): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
        return new vscode.DebugAdapterInlineImplementation(
            new CreatorDebugSession(),
        );
    }
}
