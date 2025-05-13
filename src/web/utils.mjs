/*
 *  Copyright 2018-2025 Felix Garcia Carballeira, Alejandro Calderon Mateos,
 *                      Diego Camarmas Alonso, Luis Daniel Casais Mezquida
 *
 *  This file is part of CREATOR.
 *
 *  CREATOR is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  CREATOR is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import $ from "jquery"

import { creator_ga } from "@/core/utils/creator_ga.mjs"


/*Stop the transmission of events to children*/
export function destroyClickedElement(event) {
    document.body.removeChild(event.target)
}

export function confirmExit() {
    return "He's tried to get off this page. Changes may not be saved."
}

export function console_log(m) {
    if (creator_debug) {
        console.log(m)
    }
}

// eslint-disable-next-line prefer-const
export let notifications = []

/**
 * Shows a notification on the UI and .
 *
 * @param {string} msg - Notification message.
 * @param {string} type - Type of notification, one of `'success'`, `'warning'` or `'danger'`.
 * @param {(obj: ToastOrchestratorShowParam) => ControllerKey, null} showToast - Toast controller's `show` function, obtained from `const { show } = useToastController()` inside a Component's `setup` function.
 *
 */
export function show_notification(msg, type) {
    // show notification
    document.app.showToast({
        props: {
            title: " ",  // TODO: use fontawesome icons here
            body: msg,
            variant: type,
            pos: "top-center",
            value: document.app.$data.notification_time,
            // TODO: don't dismiss toast when type is danger
        }
    })

    // add notification to the notification summary
    const date = new Date()
    notifications.push({
        mess: msg,
        color: type,
        time:
            date.toLocaleTimeString('es-ES'),
        date:
            date.toLocaleDateString('es-ES')
    })

    return true
}

/*
 *  Loading
 */

let loading_handler = null

export function show_loading() {
    // if loading is programmed, skip
    if (loading_handler !== null) {
        return
    }

    // after half second show the loading spinner
    loading_handler = setTimeout(function () {
        $("#loading").show()
        loading_handler = null
    }, 500)
}

export function hide_loading() {
    // if loading is programmed, cancel it
    if (loading_handler !== null) {
        clearTimeout(loading_handler)
        loading_handler = null
    }

    // disable loading spinner
    $("#loading").hide()
}

//Show backup modal
export function backup_modal(env) {
    if (typeof Storage !== "undefined") {
        if (
            localStorage.getItem("backup_arch") != null &&
            localStorage.getItem("backup_asm") != null &&
            localStorage.getItem("backup_date") != null
        ) {
            env.$root.$emit("bv::show::modal", "copy")
        }
    }
}

export function preload_load_example(data, url) {
    if (url == null) {
        show_notification("The example doesn't exist", "info")
        return
    }

    code_assembly = data
    uielto_toolbar_btngroup.methods.assembly_compiler(code_assembly)

    // show notification
    show_notification(" The selected example has been loaded.", "success")

    // Google Analytics
    creator_ga("example", "example.loading", "example.loading." + url)
}

export function preload_find_example(example_set_available, hash) {
    for (var i = 0; i < example_set_available.length; i++) {
        for (
            var j = 0;
            j < example_available[i].length &&
            example_set_available[i].text == hash.example_set;
            j++
        ) {
            if (example_available[i][j].id === hash.example) {
                return example_available[i][j].url
            }
        }
    }

    return null
}

export function preload_find_architecture(arch_availables, arch_name) {
    for (var i = 0; i < arch_availables.length; i++) {
        if (arch_availables[i].alias.includes(arch_name)) {
            return arch_availables[i]
        }
    }

    return null
}

export function preload_example_uri(asm_decoded) {
    if (asm_decoded == null) {
        show_notification("Assembly not valid", "info")
        return
    }

    code_assembly = asm_decoded
    uielto_toolbar_btngroup.methods.assembly_compiler(code_assembly)

    // show notification
    show_notification("The assembly code has been loaded.", "success")

    // Google Analytics
    creator_ga("example", "example.loading", "example.uri")
}

//
// Preload tasks
//

export let creator_preload_tasks = [
    // parameter: architecture
    {
        name: "architecture",
        action: function (app, hash) {
            const arch_name = hash.architecture.trim()
            if (arch_name === "") {
                return new Promise(function (resolve, reject) {
                    resolve("Empty architecture.")
                })
            }

            return $.getJSON(
                "architecture/available_arch.json",
                function (arch_availables) {
                    const a_i = preload_find_architecture(
                        arch_availables,
                        arch_name,
                    )
                    uielto_preload_architecture.methods.load_arch_select(a_i)
                    return "Architecture loaded."
                },
            )
        },
    },

    // parameter: example_set
    {
        name: "example_set",
        action: function (app, hash) {
            const exa_set = hash.example_set.trim()
            if (exa_set === "") {
                return new Promise(function (resolve, reject) {
                    resolve("Empty example set.")
                })
            }

            uielto_preload_architecture.methods.load_examples_available(
                hash.example_set,
            )
            return uielto_preload_architecture.data.example_loaded
        },
    },

    // parameter: example
    {
        name: "example",
        action: function (app, hash) {
            return new Promise(function (resolve, reject) {
                const url = preload_find_example(example_set_available, hash)
                if (null == url) {
                    reject("Example not found.")
                }

                $.get(url, function (data) {
                    preload_load_example(data, url)
                })

                resolve("Example loaded.")
            })
        },
    },

    // parameter: asm
    {
        name: "asm",
        action: function (app, hash) {
            return new Promise(function (resolve, reject) {
                const assembly = hash.asm.trim()
                if (assembly === "") {
                    return new Promise(function (resolve, reject) {
                        resolve("Empty assembly.")
                    })
                }

                var asm_decoded = decodeURI(assembly)
                preload_example_uri(asm_decoded)

                resolve("Assembly loaded.")
            })
        },
    },
]

//
// Preload work
//

export function creator_preload_get2hash(window_location) {
    let hash = {}
    let hash_field = ""
    let uri_obj = null

    // 1.- check params
    if (typeof window_location === "undefined") {
        return hash
    }

    // 2.- get parameters
    const parameters = new URL(window_location).searchParams
    for (let i = 0; i < creator_preload_tasks.length; i++) {
        hash_field = creator_preload_tasks[i].name
        hash[hash_field] = parameters.get(hash_field)

        // overwrite null with default values
        if (hash[hash_field] === null) {
            hash[hash_field] = ""
        }
    }

    return hash
}

export async function creator_preload_fromHash(app, hash) {
    var key = ""
    var act = function () {}

    // preload tasks in order
    var o = ""
    for (var i = 0; i < creator_preload_tasks.length; i++) {
        key = creator_preload_tasks[i].name
        act = creator_preload_tasks[i].action

        if (hash[key] !== "") {
            try {
                var v = await act(app, hash)
                o = o + v + "<br>"
            } catch (e) {
                o = o + e + "<br>"
            }
        }
    }

    // return ok
    return o
}
