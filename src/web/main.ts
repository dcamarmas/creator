/**
 *  Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso,
 *                      Alejandro Calderon Mateo, Luis Daniel Casais Mezquida
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

import { createApp } from "vue";
import App from "./App.vue";

// Import Bootstrap
import { createBootstrap } from "bootstrap-vue-next";
import "./scss/bootstrap.scss";

// import Fontawesome
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
library.add(fas, far, fab);

import {show_notification } from "./utils.mjs";
import { creator_ga } from "../core/utils/creator_ga.mjs";

/*Closing alert*/
window.onbeforeunload = function (e) {
    // Cancel the event to trigger the confirmation dialog
    e.preventDefault();
}

// Vue config
const app = createApp(App)
    .component("font-awesome-icon", FontAwesomeIcon)
    .use(createBootstrap());

//Error handler
app.config.errorHandler = function (err, _vm, _info) {
    // Log the error for debugging
    console.error("Vue error:", err, _info);

    // Show notification to the user
    show_notification(
        `An error has occurred, the simulator is going to restart.\nError: ${err}`,
        "danger",
    );
    setTimeout(() => {
        location.reload();
    }, 3000);
};

try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (document as any).app = app.mount("#app"); // store in document so we can access it through JS as `document.app`
} catch (e) {
    // Critical mounting error - this should restart
    show_notification(
        "A critical error has occurred during initialization, the simulator will restart.\nError: " +
            e,
        "danger",
    );

    /* Google Analytics */
    creator_ga("creator", "creator.exception", "creator.exception." + e);

    setTimeout(() => {
        location.reload();
    }, 3000);
}
