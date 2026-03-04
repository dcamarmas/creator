import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import '@wokwi/elements'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faTrash, faPalette, faRotate, faRightLeft, faMagnifyingGlassPlus, faMagnifyingGlassMinus,faBars, faUpload, faDownload, faInfinity, faWrench, faRotateLeft, faRotateRight, faInfo, faMoon,faCirclePlus, faMusic, faVolumeXmark} from '@fortawesome/free-solid-svg-icons'
import { faPlay, faGift} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// main.ts
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

import './assets/main.scss'
library.add(faTrash, faPalette, faRotate, faRightLeft, faMagnifyingGlassPlus, faMagnifyingGlassMinus, faBars, faPlay)
library.add(faUpload, faDownload, faInfinity, faWrench, faRotateLeft,faRotateRight, faInfo, faMoon, faCirclePlus, faGift, faMusic, faVolumeXmark)

import Vue3ColorPicker from "vue3-colorpicker";
import "vue3-colorpicker/style.css";

const app = createApp(App)
app.component('fa-icon', FontAwesomeIcon)
app.use(Vue3ColorPicker)
app.mount('#app')
