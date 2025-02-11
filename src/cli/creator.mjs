'use strict';



import fs from 'fs';
import colors from 'colors';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// creator
import * as creator from '../core/core.mjs';
const creator_version = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8')).version;

// color
const color_theme = {
    info: 'bgGreen',
    help: 'green',
    warn: 'yellow',
    success: 'cyan',
    error: 'bgRed'
};
const gray_theme = {
    info: 'white',
    help: 'gray',
    warn: 'white',
    success: 'white',
    error: 'brightWhite'
};
colors.setTheme(color_theme);

// arguments
const argv = yargs(hideBin(process.argv))
    .usage(welcome() + '\n' +
        'Usage: $0 -a <file name> -s <file name>\n' +
        'Usage: $0 -h')
    .example([['./$0',
        'To show examples.']])
    .option('debug', {
        type: 'boolean',
        describe: 'Enable debug mode',
        default: false
    })
    .option('architecture', {
        alias: 'a',
        type: 'string',
        describe: 'Architecture file',
        nargs: 1,
        default: ''
    })
    .option('assembly', {
        alias: 's',
        type: 'string',
        describe: 'Assembly file',
        nargs: 1,
        default: ''
    })
    .option('directory', {
        alias: 'd',
        type: 'string',
        describe: 'Assemblies directory',
        nargs: 1,
        default: ''
    })
    .option('library', {
        alias: 'l',
        type: 'string',
        describe: 'Assembly library file',
        nargs: 1,
        default: ''
    })
    .option('result', {
        alias: 'r',
        type: 'string',
        describe: 'Result file to compare with',
        nargs: 1,
        default: ''
    })
    .option('describe', {
        type: 'string',
        describe: 'Help on element',
        nargs: 1,
        default: ''
    })
    .option('maxins', {
        type: 'string',
        describe: 'Maximum number of instructions to be executed',
        nargs: 1,
        default: '1000000'
    })
    .option('output', {
        alias: 'o',
        type: 'string',
        describe: 'Define output format',
        nargs: 1,
        default: 'normal'
    })
    .option('color', {
        type: 'boolean',
        describe: 'Colored output',
        default: false
    })
    .option('config', {
        alias: 'c',
        type: 'string',
        describe: 'JSON configuration file containing multiple run configurations',
        nargs: 1,
        default: ''
    })
    .option('json-output', {
        type: 'string',
        describe: 'Output file for JSON results',
        nargs: 1,
        default: ''
    })
    .demandOption([], 'Please provide either a config file or both architecture and assembly files.')
    .help('h')
    .alias('h', 'help')
    .argv;

// Set the debug mode
creator.set_debug(argv.debug);

//
// Main
//

try {
    colors.disable();
    if (argv.color) {
        colors.enable();
        colors.setTheme(color_theme);
    }

    const limit_n_ins = parseInt(argv.maxins);
    const output_format = argv.output.toUpperCase();

    // Handle JSON configuration file
    if (argv.config) {
        const results = execute_configurations(argv.config, limit_n_ins);
        console.log(results)
        if (argv.jsonOutput) {
            fs.writeFileSync(argv.jsonOutput, JSON.stringify(results, null, 2));
        }
        if (output_format === 'NORMAL') {
            console.log(JSON.stringify(results, null, 2));
        }
        process.exit(0);
    }

    // work: a) help and usage
    if ((argv.a != "") && (argv.describe != "")) {
        let o = help_describe(argv);
        console.log(welcome() + '\n' + o);
        process.exit(0);
    }

    if ((argv.a == "") || ((argv.s == "") && (argv.d == ""))) {
        let o = help_usage();
        console.log(welcome() + '\n' + o);
        process.exit(0);
    }

    // work: welcome
    if (output_format == "NORMAL") {
        const msg = welcome();
        console.log(msg.success);
    }

    // work: b) list assembly files
    const file_names = [];
    if (argv.assembly !== '') {
        file_names.push(argv.assembly);
    }

    if (argv.directory !== '') {
        let files = fs.readdirSync(argv.directory);
        files.forEach(function (file) {
            file_names.push(argv.directory + '/' + file);
        });
    }

    // work: b) commands and switches
    let hdr = '';
    let stage = '';
    let ret = null;
    for (let i = 0; i < file_names.length; i++) {
        hdr = 'FileName';
        show_result(output_format, file_names[i], file_names[i], '', true);

        ret = one_file(argv.architecture, argv.library, file_names[i], limit_n_ins, argv.result);

        // info: show possible errors
        for (let j = 0; j < ret.stages.length; j++) {
            stage = ret.stages[j];
            hdr = hdr + ',\t' + stage;

            if (ret[stage].status !== "ok")
                show_result(output_format, stage, 'ko', ret[stage].msg.error, true);
            else show_result(output_format, stage, 'ok', ret[stage].msg.success, false);
        }

        // info: "check differences" or "print finalmachine state"
        if (argv.result !== '') {
            hdr = hdr + ',\tState';
            show_result(output_format, 'State', 'ko', ret['LastState'].msg.error, true);
            //continue ;
            if (ret.LastState.status != "ok") {
                process.exit(-1);
            }
        }

        hdr = hdr + ',\tFinalState\n';
        ret = creator.get_state();
        if (argv.result === '') {
            show_result(output_format, 'FinalState', 'is', ret.msg, true);
            console.log('');
        }
    }

    if (output_format == "TAB") {
        console.log(hdr);
    }
    process.exit(0);
}
catch (e) {
    console.log(e.stack);
    process.exit(-1);
}


//
// Functions
//

/**
 * Displays the welcome message with version information
 * @returns {string} The formatted welcome message
 */
function welcome() {
    return '\n' +
        'CREATOR\n'.help +
        '-------\n'.help +
        'version: '.help + creator_version.help + '\n'.help +
        'website: https://creatorsim.github.io/\n'.help;
}

/**
 * Shows usage information for the CLI
 * @returns {string} The usage help text
 */
function help_usage() {
    return 'Usage:\n' +
        ' * To compile and execute an assembly file on an architecture:\n' +
        '   ./creator.sh -a <architecture file name> -s <assembly file name>\n' +
        ' * Same as before but execute only 10 instructions:\n' +
        '   ./creator.sh -a <architecture file name> -s <assembly file name> --maxins 10\n' +
        '\n' +
        ' * Same as before and save the final state in a result file:\n' +
        '   ./creator.sh -a <architecture file name> -s <ok assembly file name> -o min > <result file>\n' +
        ' * To compile and execute an assembly file, and check the final state with a result file:\n' +
        '   ./creator.sh -a <architecture file name> -s <assembly file name> -o min -r <result file>\n' +
        '\n' +
        ' * To get a summary of the instructions/pseudoinstructions:\n' +
        '   ./creator.sh -a <architecture file name> --describe <instructions|pseudo>\n' +
        '\n' +
        ' * To get more information:\n' +
        '   ./creator.sh -h\n';
}

/**
 * Provides detailed description of instructions or pseudo-instructions
 * @param {Object} argv - The command line arguments object
 * @param {string} argv.architecture - Path to architecture file
 * @param {string} argv.describe - Type of description requested
 * @returns {string} Description of instructions or pseudo-instructions
 */
function help_describe(argv) {
    // load architecture
    try {
        const architecture = fs.readFileSync(argv.architecture, 'utf8');
        let ret = creator.load_architecture(architecture);
        if (ret.status !== "ok") {
            throw ret.errorcode;
        }
    }
    catch (e) {
        let msg = '\n' + e.toString();
        msg = msg.split("\n").join("\n[Architecture] ");
        console.log(msg);
        process.exit(-1);
    }

    // show description
    let o = '';
    if (argv.describe.toUpperCase().startsWith('INS')) {
        o = creator.help_instructions();
    }
    if (argv.describe.toUpperCase().startsWith('PSEUDO')) {
        o = creator.help_pseudoins();
    }

    return o;
}

/**
 * Displays execution results in various formats
 * @param {string} output_format - Output format (NORMAL|MIN|TAB|PRETTY)
 * @param {string} stage - Current execution stage
 * @param {string} status - Status of the operation (ok|ko)
 * @param {string} msg - Message to display
 * @param {boolean} show_in_min - Whether to show in minimal output mode
 */
function show_result(output_format, stage, status, msg, show_in_min) {
    switch (output_format) {
        case "NORMAL":
            msg = "[" + stage + "] " + msg;
            msg = msg.split("\n").join("\n[" + stage + "] ");
            console.log(msg.success);
            break;

        case "MIN":
            if (show_in_min) {
                console.log(msg);
            }
            break;

        case "TAB":
            process.stdout.write(status + ',\t\t');
            break;

        case "PRETTY":
            if (stage === 'FinalState') {
                console.log("[" + stage + "]");
                const values = msg.split(';').filter(s => s.trim());
                values.forEach(value => {
                    console.log(value.trim().success);
                });
            }
            break;

        default:
            console.log('[' + stage + '] ' + msg + '\n');
            break;
    }
}

/**
 * Processes a single assembly file through all stages
 * @param {string} argv_architecture - Path to architecture file
 * @param {string} argv_library - Path to library file
 * @param {string} argv_assembly - Path to assembly file
 * @param {number} limit_n_ins - Maximum number of instructions to execute
 * @param {string} argv_result - Path to result file for comparison
 * @returns {Object} Result object containing status of all stages
 * @returns {Object} result.Architecture - Architecture loading results
 * @returns {Object} result.Library - Library loading results
 * @returns {Object} result.Compile - Compilation results
 * @returns {Object} result.Execute - Execution results
 * @returns {Object} result.LastState - Final state comparison results
 * @returns {string[]} result.stages - Array of stage names
 */
function one_file(argv_architecture, argv_library, argv_assembly, limit_n_ins, argv_result) {
    let msg1 = '';
    let ret = null;
    const ret1 = {
        'Architecture': { 'status': 'ko', 'msg': 'Not loaded' },
        'Library': { 'status': 'ok', 'msg': 'Without library' },
        'Compile': { 'status': 'ko', 'msg': 'Not compiled' },
        'Execute': { 'status': 'ko', 'msg': 'Not executed' },
        'LastState': { 'status': 'ko', 'msg': 'Not equals states' },
        'stages': ['Architecture', 'Library', 'Compile', 'Execute']
    };

    // (a) load architecture
    try {
        const architecture = fs.readFileSync(argv_architecture, 'utf8');
        ret = creator.load_architecture(architecture);
        if (ret.status !== "ok") {
            throw ret.errorcode;
        }

        ret1.Architecture = { 'status': 'ok', 'msg': "Architecture '" + argv.a + "' loaded successfully." };
    }
    catch (e) {
        ret1.Architecture = { 'status': 'ko', 'msg': e.toString() };
        return ret1;
    }

    // (b) link
    if (argv_library !== '') {
        try {
            const library = fs.readFileSync(argv_library, 'utf8');
            ret = creator.load_library(library);
            if (ret.status !== "ok") {
                throw ret.msg;
            }

            ret1.Library = { 'status': 'ok', 'msg': "Code '" + argv.l + "' linked successfully." };
        }
        catch (e) {
            ret1.Library = { 'status': 'ko', 'msg': e.toString() };
            return ret1;
        }
    }

    // (c) compile
    try {
        const architecture = fs.readFileSync(argv_architecture, 'utf8');
        const assembly = fs.readFileSync(argv_assembly, 'utf8');
        ret = creator.assembly_compile(assembly);
        if (ret.status !== "ok") {
            msg1 = "\nError at line " + (ret.line + 1);
            if (ret.token !== '') msg1 += " (" + ret.token + ")";
            msg1 += ":\n" + ret.msg;
            throw msg1;
        }

        ret1.Compile = { 'status': 'ok', 'msg': "Code '" + argv.s + "' compiled successfully." };
    }
    catch (e) {
        ret1.Compile = { 'status': 'ko', 'msg': e.toString() };
        return ret1;
    }

    // (d) ejecutar
    try {
        ret = creator.execute_program(limit_n_ins);
        if (ret.status !== "ok") {
            msg1 = "\n Error found." +
                "\n " + ret.msg;
            throw msg1;
        }

        ret1.Execute = { 'status': 'ok', 'msg': "Executed successfully." };
    }
    catch (e) {
        ret1.Execute = { 'status': 'ko', 'msg': e.toString() };
        return ret1;
    }

    // (e) compare results
    if (argv_result !== '') {
        const result = fs.readFileSync(argv_result, 'utf8');
        ret = creator.get_state();
        ret = creator.compare_states(result, ret.msg);

        if (ret.msg !== '')
            ret1.LastState = { 'status': 'ko', 'msg': ret.msg };
        else ret1.LastState = { 'status': 'ok', 'msg': 'Equals' };

        return ret1;
    }

    // the end
    return ret1;
}

/**
 * Reads and executes multiple configurations from a JSON file
 * @param {string} config_file - Path to JSON configuration file
 * @param {number} default_limit_n_ins - Default instruction limit
 * @returns {Object[]} Array of execution results
 */
function execute_configurations(config_file, default_limit_n_ins) {
    try {
        const config = JSON.parse(fs.readFileSync(config_file, 'utf8'));
        if (!Array.isArray(config)) {
            throw new Error('Configuration file must contain an array of run configurations');
        }

        const results = [];
        for (const run of config) {
            const required = ['name', 'architecture', 'assembly'];
            const missing = required.filter(field => !(field in run));
            if (missing.length > 0) {
                throw new Error(`Missing required fields: ${missing.join(', ')} in configuration: ${run.name || 'unnamed'}`);
            }

            const result = {
                name: run.name,
                config: run,
                result: one_file(
                    run.architecture,
                    run.library || '',
                    run.assembly,
                    run.maxins || default_limit_n_ins,
                    run.result || ''
                )
            };
            console.log(result)
            
        }
        return results;

    } catch (error) {
        console.error('Error processing configuration file:', error.message);
        process.exit(1);
    }
}

