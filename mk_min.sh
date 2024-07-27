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
    components/general/creator_uielto_toolbar.js \
    components/general/creator_uielto_toolbar_btngroup.js \
    components/general/creator_uielto_configuration.js \
    components/general/creator_uielto_info.js \
    components/general/creator_uielto_about.js \
    components/general/creator_uielto_author.js \
    components/general/creator_uielto_notifications.js \
    components/general/creator_uielto_instruction_help.js \
    \
    components/load_architecture/creator_uielto_preload_architecture.js \
    components/load_architecture/creator_uielto_new_architecture.js \
    components/load_architecture/creator_uielto_load_architecture.js \
    components/load_architecture/creator_uielto_delete_architecture.js \
    components/load_architecture/creator_uielto_backup.js \
    \
    components/architecture/creator_uielto_save_architecture.js \
    components/architecture/configuration/creator_uielto_arch_conf.js \
    components/architecture/configuration/creator_uielto_arch_conf_edit.js \
    components/architecture/configuration/creator_uielto_arch_conf_reset.js \
    components/architecture/memory_layout/creator_uielto_memory_layout.js \
    components/architecture/memory_layout/creator_uielto_memory_layout_edit.js \
    components/architecture/memory_layout/creator_uielto_memory_layout_reset.js \
    components/architecture/register_file/creator_uielto_register_file.js \
    components/architecture/register_file/creator_uielto_register_file_new.js \
    components/architecture/register_file/creator_uielto_register_file_reset.js \
    components/architecture/register_file/creator_uielto_register_file_edit.js \
    components/architecture/register_file/creator_uielto_register_file_delete.js \
    components/architecture/registers/creator_uielto_registers.js \
    components/architecture/registers/creator_uielto_registers_new.js \
    components/architecture/registers/creator_uielto_registers_edit.js \
    components/architecture/registers/creator_uielto_registers_delete.js \
    components/architecture/instructions/creator_uielto_instructions.js \
    components/architecture/instructions/creator_uielto_instructions_fields.js \
    components/architecture/instructions/creator_uielto_instructions_new.js \
    components/architecture/instructions/creator_uielto_instructions_reset.js \
    components/architecture/instructions/creator_uielto_instructions_edit.js \
    components/architecture/instructions/creator_uielto_instructions_delete.js \
    components/architecture/pseudoinstructions/creator_uielto_pseudoinstructions.js \
    components/architecture/pseudoinstructions/creator_uielto_pseudoinstructions_fields.js \
    components/architecture/pseudoinstructions/creator_uielto_pseudoinstructions_new.js \
    components/architecture/pseudoinstructions/creator_uielto_pseudoinstructions_reset.js \
    components/architecture/pseudoinstructions/creator_uielto_pseudoinstructions_edit.js \
    components/architecture/pseudoinstructions/creator_uielto_pseudoinstructions_delete.js \
    components/architecture/directives/creator_uielto_directives.js \
    components/architecture/directives/creator_uielto_directives_new.js \
    components/architecture/directives/creator_uielto_directives_reset.js \
    components/architecture/directives/creator_uielto_directives_edit.js \
    components/architecture/directives/creator_uielto_directives_delete.js \
    \
    components/assembly/creator_uielto_load_assembly.js \
    components/assembly/creator_uielto_save_assembly.js \
    components/assembly/creator_uielto_examples.js \
    components/assembly/creator_uielto_uri.js \
    components/assembly/creator_uielto_load_library.js \
    components/assembly/creator_uielto_save_library.js \
    components/assembly/creator_uielto_textarea_assembly.js \
    components/assembly/creator_uielto_shortcuts.js \
    components/assembly/creator_uielto_error.js \
    components/assembly/creator_uielto_library_tags.js \
    \
    components/simulator/creator_uielto_target_flash.js \
    components/simulator/creator_uielto_calculator.js \
    components/simulator/creator_uielto_table_execution.js \
    components/simulator/creator_uielto_data_view_selector.js \
    components/simulator/creator_uielto_register_file.js \
    components/simulator/creator_uielto_register.js \
    components/simulator/creator_uielto_register_popover.js \
    components/simulator/creator_uielto_memory.js \
    components/simulator/creator_uielto_memory_table.js \
    components/simulator/creator_uielto_stats.js \
    components/simulator/creator_uielto_stats_plot.js \
    components/simulator/creator_uielto_stats_table.js \
    components/simulator/creator_uielto_clk_cycles.js \
    components/simulator/creator_uielto_clk_cycles_plot.js \
    components/simulator/creator_uielto_clk_cycles_table.js \
    components/simulator/creator_uielto_monitor.js \
    components/simulator/creator_uielto_keyboard.js \
    \
    js/assembler/base.js \
    js/assembler/memory_segments.js \
    js/assembler/datatypes.js \
    js/assembler/directives.js \
    js/assembler/lexical.js \
    js/assembler/compiler1_prepare_creator.js \
    js/assembler/compiler2_asm_obj.js \
    js/assembler/compiler3_obj2mem_creator.js \
    js/assembler/compiler_options.js \
    js/assembler/compiler.js \
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

