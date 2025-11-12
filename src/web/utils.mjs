/**
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

import humanizeDuration from "humanize-duration";

import { creator_ga } from "@/core/utils/creator_ga.mjs";
import { loadArchitecture } from "@/core/core.mjs";
import { console_log as clog } from "@/core/utils/creator_logger.mjs";
import example_set from "../../examples/example_set.json" with { type: "json" };

/*Stop the transmission of events to children*/
export function destroyClickedElement(event) {
    document.body.removeChild(event.target);
}

export function console_log(msg, level = "INFO") {
    if (document.app.c_debug) {
        clog(msg, level);
    }
}

// eslint-disable-next-line prefer-const
export let notifications = [];

/**
 * Shows a notification on the UI and.
 *
 * @param {string} msg Notification message.
 * @param {string} type Type of notification, one of `'success'`, `'warning'` ,
 * `'info'` or `'danger'`.
 * @param {Object} [root] Root Vue component (App)
 *
 */
export function show_notification(msg, type, root = document.app) {
    // show notification
    root.createToast({
        props: {
            title: " ", // TODO: use fontawesome icons here
            body: msg,
            variant: type,
            position: "bottom-end",
            value: root.notification_time,
            // TODO: don't dismiss toast when type is danger
        },
    });

    // add notification to the notification summary
    const date = new Date();
    notifications.push({
        mess: msg,
        color: type,
        time: date.toLocaleTimeString("es-ES"),
        date: date.toLocaleDateString("es-ES"),
    });

    return true;
}

export function crex_show_notification(msg, level) {
    if (typeof window !== "undefined") show_notification(msg, level);
    else console.log(level.toUpperCase() + ": " + msg);
}

/*
 *  Loading
 */

let loading_handler = null;

export function show_loading() {
    // if loading is programmed, skip
    if (loading_handler !== null) {
        return;
    }

    // // after half second show the loading spinner
    // loading_handler = setTimeout(function () {
    //     $("#loading").show();
    //     loading_handler = null;
    // }, 500);
}

export function hide_loading() {
    // if loading is programmed, cancel it
    if (loading_handler !== null) {
        clearTimeout(loading_handler);
        loading_handler = null;
    }

    // disable loading spinner
    // $("#loading").hide();
}

/**
 * @typedef {Object} DefaultArchitecture
 * @property {string} name Architecture name
 * @property {Array<string>} alias Name aliases
 * @property {string} file Architecture definition file name (inside /architectures/ folder)
 * @property {string} img Architecture image file location (absolute)
 * @property {string} alt Alternative name
 * @property {string} id ID (select_conf<something>)
 * @property {Array<string>} examples List of example sets
 * @property {string} description
 * @property {string} guide Path to guide file (absolute)
 * @property {boolean} available Whether it's available or not
 * @property {boolean} [default=true]
 */

/**
 * Loads the specified default architecture
 * @param {DefaultArchitecture} arch Architecture object, as defined in available_arch.json
 * @param {Object} [root] Root Vue component (App)
 */
export async function loadDefaultArchitecture(arch, root = document.app) {
    // show_loading()

    try {
        const response = await fetch("architecture/" + arch.file + ".yml");

        if (!response.ok) {
            throw new Error("Architecture file not found");
        }

        let cfg = await response.text();
        const { status, errorcode, token } = loadArchitecture(cfg);

        if (status === "ko") {
            show_notification(`[${errorcode}] ${token}`, "danger", root);

            return;
        }

        // remove schema comment
        cfg = cfg.replace(/^# yaml-language-server: \$schema=.+\n/, "");

        // store code to be edited
        root.arch_code = cfg;

        // Google Analytics
        creator_ga(
            "architecture",
            "architecture.loading",
            "architectures.loading.preload_cache",
        );

        // hide_loading()
    } catch (_error) {
        show_notification(
            arch.name + " architecture is not currently available",
            "danger",
            root,
        );

        // hide_loading()
    }
}

/**
 * Loads the specified custom architecture
 * @param {AvailableArch} arch Architecture object
 * @param {Object} [root] Root Vue component (App)
 */
export function loadCustomArchitecture(arch, root = document.app) {
    const { status, errorcode, token } = loadArchitecture(arch.definition);

    if (status === "ko") {
        show_notification(`[${errorcode}] ${token}`, "danger", root);

        return;
    }

    // store code to be edited
    root.arch_code = arch.definition;

    // Google Analytics
    creator_ga(
        "architecture",
        "architecture.loading",
        "architectures.loading.preload_cache",
    );
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
export async function loadExample(
    architecture_name,
    set_name,
    example_id,
    root = document.app,
) {
    try {
        // get specified example set
        const setUrl = example_set.find(
            set =>
                set.architecture === architecture_name && set.id === set_name,
        );

        if (!setUrl) {
            show_notification(`'${set_name}' set not found`, "danger", root);
            return;
        }

        const setResponse = await fetch(setUrl.url);

        if (!setResponse.ok) {
            show_notification(`'${set_name}' set not found`, "danger", root);
            return;
        }

        // load list of examples of the set
        const example_list = await setResponse.json();

        // get code uri
        const exampleUrl = example_list.find(
            example => example.id === example_id,
        )?.url;

        if (!exampleUrl) {
            show_notification(
                `'${example_id}' example not found`,
                "danger",
                root,
            );
            return;
        }

        const codeResponse = await fetch(exampleUrl);

        if (!codeResponse.ok) {
            show_notification(
                `'${example_id}' example not found`,
                "danger",
                root,
            );
            return;
        }

        const code = await codeResponse.text();
        root.assembly_code = code;

        // FIXME: as we can't compile (see above), we go to the
        // assembly view, when we should go to simulator view
        root.creator_mode = "assembly";

        show_notification(
            `Loaded example '${set_name}-${example_id}'`,
            "success",
            root,
        );
    } catch (_error) {
        show_notification(`'${set_name}' set not found`, "danger", root);
    }
}

/**
 * Stores a backup of the code and architecture in localStorage
 *
 * @param {Object} [root] Root Vue component (App)
 */
export function storeBackup(root = document.app) {
    if (!root.assembly_code || !root.arch_code || !root.architecture_name) {
        clog("Unable to store backup", "WARN");
        return;
    }

    if (!root.backup) {
        // disabled in config
        return;
    }

    localStorage.setItem("backup_asm", root.assembly_code);
    localStorage.setItem("backup_arch", root.arch_code);
    localStorage.setItem("backup_arch_name", root.architecture_name);
    localStorage.setItem("backup_timestamp", Date.now());
}

/**
 * Returns the time elapsed since the specified date in a human-readable format.
 *
 * @param {Date} date
 *
 * @returns {String}
 */
export function formatRelativeDate(date) {
    // I tried using Intl.RelativeTimeFormat... it didn't go well

    return (
        humanizeDuration(date.getTime() - Date.now(), { round: true })
            // we only want the biggest unit
            .split(",")
            .shift() + " ago"
    );
}

/**
 * Downloads the specified data as a file with the specified filename.
 *
 * @param {String} data data to store in file
 * @param {String} filename Name of the file
 * @param {String} mimetype MIME type of the file
 *
 */
export function downloadToFile(data, filename, mimetype = "text/plain") {
    // yes, this is actually the way to do it in JS...

    const downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.innerHTML = "My Hidden Link";

    window.URL = window.URL || window.webkitURL;

    downloadLink.href = window.URL.createObjectURL(
        new Blob([data], { type: mimetype }),
    );
    downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);

    downloadLink.click();
}

/**
 * Downloads a file in the specified (relative) URL to the specified filename.
 *
 * @param {String} url URL of the source file. It must start with `/`, e.g.
 * `"/gateway/esp32c.zip"`
 * @param {String} filename Name of the saved file
 * @param {boolean} [notify=false] Whether to notify the file has been downloaded or not
 */
export function downloadFile(url, filename, notify = false) {
    fetch(
        window.location.origin +
            window.location.pathname.replace(/\/+$/, "") +
            url,
    )
        // check to make sure you didn't have an unexpected failure (may need to check other things here depending on use case / backend)
        .then(resp =>
            resp.status === 200
                ? resp.blob()
                : Promise.reject("something went wrong"),
        )
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);

            if (notify) {
                show_notification("File downloaded", "success");
            }
        })
        .catch(() => show_notification("Error downloading file", "error"));
}

/**
 *
 * Transforms a value into a hextring.
 *
 * @param {number | bigint} value
 * @param {number} [padding=0] Padding, in bytes
 *
 * @returns {string}
 */
export function toHex(value, padding = 0) {
    return value
        .toString(16)
        .padStart(padding * 2, "0")
        .toUpperCase();
}
