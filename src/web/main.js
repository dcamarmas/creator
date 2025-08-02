/*
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

import { confirmExit, show_notification } from "./utils.mjs";
import { creator_ga } from "../core/utils/creator_ga.mjs";
import { initCAPI } from "@/core/core.mjs";

/*Closing alert*/
window.onbeforeunload = confirmExit;

// jquery
import $ from "jquery";
window.$ = $;

// Vue config

const app = createApp(App)
    .component("font-awesome-icon", FontAwesomeIcon)
    .use(createBootstrap());

//Error handler
app.config.errorHandler = function (err, _vm, _info) {
    show_notification(
        `An error has ocurred, the simulator is going to restart.\nError: ${err}`,
        "danger",
    );
    setTimeout(function () {
        location.reload(true);
    }, 3000);
};

try {
    document.app = app.mount("#app"); // store in document so we can access it through JS as `document.app`
} catch (e) {
    show_notification(
        "An error has ocurred, the simulator is going to restart.  \n Error: " +
            e,
        "danger",
    );

    /* Google Analytics */
    creator_ga("creator", "creator.exception", "creator.exception." + e);

    setTimeout(function () {
        location.reload(true);
    }, 3000);
}
