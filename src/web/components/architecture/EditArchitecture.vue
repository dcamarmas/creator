<!--
Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos

This file is part of CREATOR.

CREATOR is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

CREATOR is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
-->

<script>
export default {
  props: {
    id: { type: String, required: true },
    arch_code: { type: String, required: true },
  },

  methods: {
    architecture_codemirror_start() {
      // TODO: migrate to Codemirror6 (see https://discuss.codemirror.net/t/codemirror-6-and-textareas/2731/5)
      const editor_cfg = {
        lineNumbers: true,
        autoRefresh: true,
      }

      const textarea_arch_obj = document.getElementById('textarea_architecture')

      if (textarea_arch_obj != null) {
        textarea_arch_editor = CodeMirror.fromTextArea(textarea_arch_obj, editor_cfg)
        textarea_arch_editor.setOption('keyMap', 'sublime') // vim -> 'vim', 'emacs', 'sublime', ...
        textarea_arch_editor.setValue(app._data.arch_code)
        textarea_arch_editor.setSize('auto', '70vh')
      }
    },
    assembly_codemirror_start() {
      // TODO: migrate to Codemirror6 (see https://discuss.codemirror.net/t/codemirror-6-and-textareas/2731/5)
      const editor_cfg = {
        lineNumbers: true,
        autoRefresh: true,
      }

      const textarea_assembly_obj = document.getElementById('textarea_assembly')

      if (textarea_assembly_obj != null) {
        textarea_assembly_editor = CodeMirror.fromTextArea(textarea_assembly_obj, editor_cfg)
        textarea_assembly_editor.setOption('keyMap', 'sublime') // vim -> 'vim', 'emacs', 'sublime', ...
        textarea_assembly_editor.setValue(app._data.assembly_code)
        textarea_assembly_editor.setSize('auto', '70vh')

        // add Ctrl-m
        const map = {
          'Ctrl-M': function (cm) {
            cm.execCommand('toggleComment')
          },
        }
        textarea_assembly_editor.addKeyMap(map)
      }
    },

    //Load codemirror
    load_codemirror() {
      setTimeout(function () {
        architecture_codemirror_start()

        if (codemirrorHistory != null) {
          textarea_arch_editor.setHistory(codemirrorHistory)
          textarea_arch_editor.undo()
        }

        textarea_arch_editor.setValue(app._data.arch_code)
      }, 50)
    },

    //Close codemirror
    arch_edit_codemirror_save() {
      app._data.arch_code = textarea_arch_editor.getValue()
      arch_code = textarea_arch_editor.getValue()
      codemirrorHistory = textarea_arch_editor.getHistory()
      textarea_arch_editor.toTextArea()
    },

    //Save edit architecture
    arch_edit_save() {
      app._data.arch_code = textarea_arch_editor.getValue()
      arch_code = textarea_arch_editor.getValue()

      //Load architecture
      let aux_architecture

      try {
        aux_architecture = JSON.parse(app._data.arch_code)
      } catch {
        show_notification('Architecture not edited. JSON format is incorrect', 'danger')
        return
      }

      load_arch_select(aux_architecture)

      uielto_preload_architecture.data.architecture_name = architecture.arch_conf[0].value
      app._data.architecture = architecture
      app._data.architecture_name = architecture.arch_conf[0].value
      app._data.architecture_hash = architecture_hash

      //Reset execution
      instructions = []
      app._data.instructions = instructions
      creator_memory_clear()

      show_notification('Architecture edited correctly', 'success')
    },
  },
}
</script>

<template>
  <b-modal
    :id="id"
    size="xl"
    title="Edit Architecture"
    ok-title="Save"
    @ok="arch_edit_save"
    @show="load_codemirror"
    @hidden="arch_edit_codemirror_save"
  >
    <textarea
      id="textarea_architecture"
      rows="14"
      class="code-scroll-y d-none"
      title="Architecture Definition"
    ></textarea>
  </b-modal>
</template>
