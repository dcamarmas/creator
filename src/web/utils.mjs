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
import { newArchitectureLoad } from "@/core/core.mjs"


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
 * Shows a notification on the UI and.
 *
 * @param {string} msg Notification message.
 * @param {string} type Type of notification, one of `'success'`, `'warning'` or `'danger'`.
 * @param {Object} root Root Vue component (App)
 *
 */
export function show_notification(msg, type, root = document.app) {
    // show notification
    root.showToast({
        props: {
            title: " ",  // TODO: use fontawesome icons here
            body: msg,
            variant: type,
            pos: "top-center",
            value: root.notification_time,
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

/**
 * Loads the specified architecture
 * @param {Object} arch Architecture object, as defined in available_arch.json
 * @param {Object} root Root Vue component (App)
 */
export function loadArchitecture(arch, root = document.app) {
    // show_loading()

    // TODO: use Fetch API instead of jquery:
    // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

    //Synchronous JSON read
    $.ajaxSetup({ async: false })

    $.get("architecture/" + arch.file + ".yml", cfg => {
        newArchitectureLoad(cfg)

        // store code to be edited
        // TODO: change this when migration w/ new core, we'll use YAMLs
        root.arch_code = JSON.stringify(
            cfg,
            // serialize BigInts
            (_key, value) =>
            typeof value === "bigint"
                ? Number(value) // FIXME: this is BAD
                : value, // return everything else unchanged
            2,
        )

        //Refresh UI
        show_notification(
            arch.name + " architecture has been loaded correctly",
            "success",
            root
        )

        // Google Analytics
        creator_ga(
            "architecture",
            "architecture.loading",
            "architectures.loading.preload_cache",
        )

        // hide_loading()

    }).fail(() => {
        show_notification(
            arch.name + " architecture is not currently available",
            "danger",
            root
        )

        // hide_loading()
    })

}

/**
 * Loads the specified example for the current architecture
 *
 * @param {string} architecture_name Name of the architecture
 * @param {string} set_name Desired set name
 * @param {string} example_id Desired example ID
 * @param {Object} root Root Vue component (App)
 *
 */
export function loadExample(
    architecture_name,
    set_name,
    example_id,
    root = document.app,
) {
    $.ajaxSetup({ async: false })

    $.getJSON(
        // get specified example set
        example_set.find(
            set =>
                set.architecture === architecture_name && set.id === set_name,
        ),
    )
        .done(
            // load list of examples of the set
            example_list => {
                $.ajaxSetup({ async: false })
                // load code
                $.get(
                    // get code uri
                    example_list.find(example => example.id === example_id)
                        ?.url,
                )
                    .done(code => {
                        root.assembly_code = code

                        // FIXME: as we can't compile (see above), we go to the
                        // assembly view, when we should go to simulator view
                        root.creator_mode = "assembly"

                        show_notification(
                            `Loaded example '${set_name}-${example_id}'`,
                            "success",
                            root,
                        )
                    })
                    .fail(() =>
                        show_notification(
                            `'${example_id}' example not found`,
                            "danger",
                            root,
                        ),
                    )
            },
        )
        .fail(() =>
            show_notification(`'${set_name}' set not found`, "danger", root),
        )
}
