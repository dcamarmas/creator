// import "@/web/assets/style.css"

import { createApp } from "vue"
import App from "./App.vue"

// Import Bootstrap
import { createBootstrap } from "bootstrap-vue-next"
import "bootstrap/dist/css/bootstrap.css"
import "bootstrap-vue-next/dist/bootstrap-vue-next.css"

// import Fontawesome
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import { library } from "@fortawesome/fontawesome-svg-core"
import { fas } from "@fortawesome/free-solid-svg-icons"
import { far } from "@fortawesome/free-regular-svg-icons"
import { fab } from "@fortawesome/free-brands-svg-icons"
library.add(fas, far, fab)

import { confirmExit, show_notification } from "./utils.mjs"
import { creator_ga } from "../core/utils/creator_ga.mjs"

/*Closing alert*/
window.onbeforeunload = confirmExit

// jquery
import $ from "jquery"
window.$ = $

// Vue config

const app = createApp(App).component("font-awesome-icon", FontAwesomeIcon).use(createBootstrap())

//Error handler
app.config.errorHandler = function (err, vm, info) {
    show_notification(
        "An error has ocurred, the simulator is going to restart.  \n Error: " +
        err,
        "danger",
    )
    setTimeout(function () {
        location.reload(true)
    }, 3000)
}

try {
    document.app = app.mount("#app")  // store in document so we can access it through JS as `document.app`
} catch (e) {
    show_notification(
        "An error has ocurred, the simulator is going to restart.  \n Error: " +
            e,
        "danger",
    )

    /* Google Analytics */
    creator_ga("creator", "creator.exception", "creator.exception." + e)

    setTimeout(function () {
        location.reload(true)
    }, 3000)
}
