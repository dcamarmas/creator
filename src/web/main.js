import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";
import "./assets/main.css";

import { confirmExit } from "./utils.mjs";

// Import Bootstrap
import { createBootstrap } from "bootstrap-vue-next";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

/*Closing alert*/
window.onbeforeunload = confirmExit;

// Vue config

const app = createApp(App);

app.use(createBootstrap());

//Error handler
app.config.errorHandler = function (err, vm, info) {
    show_notification(
        "An error has ocurred, the simulator is going to restart.  \n Error: " +
            err,
        "danger",
    );
    setTimeout(function () {
        location.reload(true);
    }, 3000);
};

try {
    app.mount("#app");
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
