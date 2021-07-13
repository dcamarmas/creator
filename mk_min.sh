#!/bin/bash

# welcome
echo ""
echo "  CREATOR packer"
echo " ----------------"
echo ""
echo "  Requirements:"
echo "  * terser, colors, yargs, readline-sync"
npm install terser jshint colors yargs readline-sync
echo ""
if [ $# -gt 0 ]; then
     set -x
fi


# skeleton
echo "  Packing:"
echo "  * min.creator_web.js..."
cat js/creator_bigint.js \
    js/creator_ga.js \
    js/creator_preload.js \
    js/creator_util.js \
    \
    js/creator_track_stack.js \
    js/creator_sentinel.js \
    js/creator_definition_api.js \
    \
    js/creator_registerfile.js \
    js/creator_memory.js \
    js/creator_compiler.js \
    js/creator_executor.js \
    \
    components/general/creator_uielto_loading.js \
    components/general/creator_uielto_supported_browser.js \
    \
    components/general/creator_uielto_navbar.js \
    components/general/creator_uielto_configuration.js \
    components/general/creator_uielto_info.js \
    components/general/creator_uielto_about.js \
    components/general/creator_uielto_author.js \
    components/general/creator_uielto_notifications.js \
    components/general/creator_uielto_instruction_help.js \
    \
    components/architecture/creator_uielto_backup.js \
    \
    components/assembly/creator_uielto_examples.js \
    components/assembly/creator_uielto_textarea_assembly.js \
    components/assembly/creator_uielto_library_tags.js \
    components/assembly/creator_uielto_shortcuts.js \
    components/assembly/creator_uielto_error.js \
    \
    components/simulator/creator_uielto_calculator.js \
    components/simulator/creator_uielto_table_execution.js \
    components/simulator/creator_uielto_data_view_selector.js \
    components/simulator/creator_uielto_register.js \
    components/simulator/creator_uielto_register_int_popover.js \
    components/simulator/creator_uielto_register_float_popover.js \
    components/simulator/creator_uielto_register_double_popover.js \
    components/simulator/creator_uielto_memory.js \
    components/simulator/creator_uielto_stats.js \
    components/simulator/creator_uielto_stats_plot.js \
    components/simulator/creator_uielto_stats_table.js \
    components/simulator/creator_uielto_monitor.js \
    components/simulator/creator_uielto_keyboard.js \
    \
    js/creator_ui.js \
    js/app.js > js/creator_web.js
terser -o js/min.creator_web.js js/creator_web.js
rm -fr js/creator_web.js


echo "  * min.creator_node.js..."
cat js/creator_bigint.js \
    js/creator_ga.js \
    js/creator_util.js \
    \
    js/creator_sentinel.js \
    js/creator_definition_api.js \
    js/creator_track_stack.js \
    \
    js/creator_registerfile.js \
    js/creator_memory.js \
    js/creator_compiler.js \
    js/creator_executor.js \
    \
    js/creator_node.js > js/min.creator_node.js


# the end
echo ""
echo "  CREATOR packed (if no error was shown)."
echo ""

