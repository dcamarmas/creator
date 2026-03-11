<script lang="ts">

import { L1_I_cache_memory } from "@/core/core.mjs";
import { defineComponent, type PropType } from "vue";

export default defineComponent({
    props: {
        cachetype:       { type: Number, required: true },
        L1_I_num_lines:  { type: Number, required: true },
        L1_I_size_block: { type: Number, required: true },
        L1_I_size:       { type: Number, required: true },
        L1_D_num_lines:  { type: Number, required: true },
        L1_D_size_block: { type: Number, required: true },
        L1_D_size:       { type: Number, required: true },
        L1_num_lines:    { type: Number, required: true },
        L1_size_block:   { type: Number, required: true },
        L1_size:         { type: Number, required: true },
        L2_I_num_lines:  { type: Number, required: true },
        L2_I_size_block: { type: Number, required: true },
        L2_I_size:       { type: Number, required: true },
        L2_D_num_lines:  { type: Number, required: true },
        L2_D_size_block: { type: Number, required: true },
        L2_D_size:       { type: Number, required: true },
        L2_num_lines:    { type: Number, required: true },
        L2_size_block:   { type: Number, required: true },
        L2_size:         { type: Number, required: true },
        cache_location:  { type: String, required: true },
        cache_policy:    { type: String, required: true },
    },

    data() {
        return {
            cachetypeForm: document.app.$data.cache_type ?? this.cachetype ?? 0,
            cache_policyForm: document.app.$data.cache_policy ?? this.cache_policy ?? 0,
            cache_locationForm: document.app.$data.cache_location ?? this.cache_location ?? 0,
            cache_architectures: [
                { text: "L1", value: 0 },
                { text: "L1_I + L1_D", value: 1},
                { text: "L1 + L2", value: 2},
                { text: "L1_I + L1_D + L2", value: 3},
                { text: "L1 + L2_I + L2_D", value: 4},
                { text: "L1_I + L1_D + L2_I + L2_D", value: 5},
            ],
            cache_locations : [
                { text: "Associative",          value: "Associative"          },
                { text: "Associative per sets", value: "Associative_per_sets" },
                { text: "Direct",               value: "Direct"               }
            ],
            running_execution : document.app.$data.execution_mode_run,
            cache_policies: [
                { text: "FIFO", value: "FIFO"},
                { text: "Random", value: "Random"},
            ],
            prevL1:   Number(document.app.$data.L1_size ?? this.L1_size) || 32,
            prevL1B:  Number(document.app.$data.L1_size_block ?? this.L1_size_block) || 32,
            prevL1LC: Number(document.app.$data.L1_num_lines ?? this.L1_num_lines) || 32,

            prevL1I:  Number(document.app.$data.L1_I_size ?? this.L1_I_size) || 32,
            prevL1IB: Number(document.app.$data.L1_I_size_block ?? this.L1_I_size_block) || 32,
            prevL1ILC: Number(document.app.$data.L1_I_num_lines ?? this.L1_I_num_lines) || 32,

            prevL1D:  Number(document.app.$data.L1_D_size ?? this.L1_D_size) || 32,
            prevL1DB: Number(document.app.$data.L1_D_size_block ?? this.L1_D_size_block) || 32,
            prevL1DLC: Number(document.app.$data.L1_D_num_lines ?? this.L1_D_num_lines) || 32,

            prevL2:   Number(document.app.$data.L2_size ?? this.L2_size) || 32,
            prevL2B:  Number(document.app.$data.L2_size_block ?? this.L2_size_block) || 32,
            prevL2LC: Number(document.app.$data.L2_num_lines ?? this.L2_num_lines) || 32,

            prevL2I:  Number(document.app.$data.L2_I_size ?? this.L2_I_size) || 32,
            prevL2IB: Number(document.app.$data.L2_I_size_block ?? this.L2_I_size_block) || 32,
            prevL2ILC: Number(document.app.$data.L2_I_num_lines ?? this.L2_I_num_lines) || 32,

            prevL2D:  Number(document.app.$data.L2_D_size ?? this.L2_D_size) || 32,
            prevL2DB: Number(document.app.$data.L2_D_size_block ?? this.L2_D_size_block) || 32,
            prevL2DLC: Number(document.app.$data.L2_D_num_lines ?? this.L2_D_num_lines) || 32,

        };
    },

    computed: {
        L1_gs: {
            get() {
                const v = document.app.$data.L1_size ?? this.L1_size;
                const n = Number(v);
                return Number.isFinite(n) ? n : 32;
            },
            set(v) {
                const n = this.pow2Step(this.prevL1, v, 32, 2048);
                document.app.$data.L1_size = n;
                this.$emit('update:L1_size', n);
                localStorage.setItem('conf_L1_size', n);
                this.prevL1 = n;
                if (this.prevL1 < this.prevL1LC || this.cache_location === "Associative"){ // Se reduce el numero de líneas por cjto
                this.prevL1LC = this.prevL1;
                document.app.$data.L1_num_lines = this.prevL1;
                this.$emit('update:L1_num_lines', n);
                localStorage.setItem('conf_L1_num_lines', n);
                }
            }
        },
        L1_gsb: {
            get() {
                const v = document.app.$data.L1_size_block ?? this.L1_size_block;
                const n = Number(v);
                return Number.isFinite(n) ? n : 32;
            },
            set(v) {
                const n = this.pow2Step(this.prevL1B, v, 32, 128);
                document.app.$data.L1_size_block = n;
                this.$emit('update:L1_size_block', n);
                localStorage.setItem('conf_L1_size_block', n);
                this.prevL1B = n;
            }
        },
        L1_gsl: {
            get() {
                const v = document.app.$data.L1_num_lines ?? this.L1_num_lines;
                const n = Number(v);
                return Number.isFinite(n) ? n : 32;
            },
            set(v) {
                const n = this.pow2Step(this.prevL1LC, v, 32, 2048);
                document.app.$data.L1_num_lines = n;
                this.$emit('update:L1_num_lines', n);
                localStorage.setItem('conf_L1_num_lines', n);
                this.prevL1LC = n;
                if (this.prevL1LC > this.prevL1) {
                this.prevL1 = this.prevL1LC;
                document.app.$data.L1_size = this.prevL1LC;
                this.$emit('update:L1_size', n);
                localStorage.setItem('conf_L1_size', n);
                }
            }
        },
        L1I_gs: {
            get() {
                const v = document.app.$data.L1_I_size ?? this.L1_I_size;
                const n = Number(v);
                return Number.isFinite(n) ? n : 32;
            },
            set(v) {
                const n = this.pow2Step(this.prevL1I, v, 32, 1024);
                document.app.$data.L1_I_size = n;
                this.$emit('update:L1_I_size', n);
                localStorage.setItem('conf_L1_I_size', n);
                this.prevL1I = n;
                if (this.prevL1I < this.prevL1ILC || this.cache_location === "Associative"){ // Se reduce el numero de líneas por cjto
                this.prevL1ILC = this.prevL1I;
                document.app.$data.L1_I_num_lines = this.prevL1I;
                this.$emit('update:L1_I_num_lines', n);
                localStorage.setItem('conf_L1_I_num_lines', n);
                }
            }
        },
        L1I_gsb: {
            get() {
                const v = document.app.$data.L1_I_size_block ?? this.L1_I_size_block;
                const n = Number(v);
                return Number.isFinite(n) ? n : 32;
            },
            set(v) {
                const n = this.pow2Step(this.prevL1IB, v, 32, 128);
                document.app.$data.L1_I_size_block = n;
                this.$emit('update:L1_I_size_block', n);
                localStorage.setItem('conf_L1_I_size_block', n);
                this.prevL1IB = n;
            }
        },
        L1I_gsl: {
            get() {
                const v = document.app.$data.L1_I_num_lines ?? this.L1_I_num_lines;
                const n = Number(v);
                return Number.isFinite(n) ? n : 32;
            },
            set(v) {
                const n = this.pow2Step(this.prevL1ILC, v, 32, 1024);
                document.app.$data.L1_I_num_lines = n;
                this.$emit('update:L1_I_num_lines', n);
                localStorage.setItem('conf_L1_I_num_lines', n);
                this.prevL1ILC = n;
                if (this.prevL1ILC > this.prevL1I) {
                this.prevL1I = this.prevL1ILC;
                document.app.$data.L1_I_size = this.prevL1ILC;
                this.$emit('update:L1_I_size', n);
                localStorage.setItem('conf_L1_I_size', n);
                }
            }
        },
        L1D_gs: {
            get() {
                const v = document.app.$data.L1_D_size ?? this.L1_D_size;
                const n = Number(v);
                return Number.isFinite(n) ? n : 32;
            },
            set(v) {
                const n = this.pow2Step(this.prevL1D, v, 32, 1024);
                document.app.$data.L1_D_size = n;
                this.$emit('update:L1_D_size', n);
                localStorage.setItem('conf_L1_D_size', n);
                this.prevL1D = n;
                if (this.prevL1D < this.prevL1DLC || this.cache_location === "Associative"){ // Se reduce el numero de líneas por cjto
                this.prevL1DLC = this.prevL1D;
                document.app.$data.L1_D_num_lines = this.prevL1D;
                this.$emit('update:L1_D_num_lines', n);
                localStorage.setItem('conf_L1_D_num_lines', n);
                }
            }
        },
        L1D_gsb: {
            get() {
                const v = document.app.$data.L1_D_size_block ?? this.L1_D_size_block;
                const n = Number(v);
                return Number.isFinite(n) ? n : 32;
            },
            set(v) {
                const n = this.pow2Step(this.prevL1DB, v, 32, 128)
                document.app.$data.L1_D_size_block = n;
                this.$emit('update:L1_D_size_block', n);
                localStorage.setItem('conf_L1_D_size_block', n);
                this.prevL1DB = n;
            }
        },
        L1D_gsl: {
            get() {
                const v = document.app.$data.L1_D_num_lines ?? this.L1_D_num_lines;
                const n = Number(v);
                return Number.isFinite(n) ? n : 32;
            },
            set(v) {
                const n = this.pow2Step(this.prevL1DLC, v, 32, 1024);
                document.app.$data.L1_D_num_lines = n;
                this.$emit('update:L1_D_num_lines', n);
                localStorage.setItem('conf_L1_D_num_lines', n);
                this.prevL1DLC = n;
                if (this.prevL1DLC > this.prevL1D) {
                this.prevL1D = this.prevL1DLC;
                document.app.$data.L1_D_size = this.prevL1DLC;
                this.$emit('update:L1_D_size', n);
                localStorage.setItem('conf_L1_D_size', n);
                }
            }
        },
        L2I_gs: {
            get() {
                const v = document.app.$data.L2_I_size ?? this.L2_I_size;
                const n = Number(v);
                return Number.isFinite(n) ? n : 32;
            },
            set(v) {
                const n = this.pow2Step(this.prevL2I, v, 32, 1024);
                document.app.$data.L2_I_size = n;
                this.$emit('update:L2_I_size', n);
                localStorage.setItem('conf_L2_I_size', n);
                this.prevL2I = n;
                if (this.prevL2I < this.prevL2ILC || this.cache_location === "Associative"){ // Se reduce el numero de líneas por cjto
                this.prevL2ILC = this.prevL1;
                document.app.$data.L2_I_num_lines = this.prevL2I;
                this.$emit('update:L2_I_num_lines', n);
                localStorage.setItem('conf_L2_I_num_lines', n);
                }
            }
        },
        L2I_gsb: {
            get() {
                const v = document.app.$data.L2_I_size_block ?? this.L2_I_size_block;
                const n = Number(v);
                return Number.isFinite(n) ? n : 32;
            },
            set(v) {
                const n = this.pow2Step(this.prevL2IB, v, 32, 128);
                document.app.$data.L2_I_size_block = n;
                this.$emit('update:L2_I_size_block', n);
                localStorage.setItem('conf_L2_I_size_block', n);
                this.prevL2IB = n;
            }
        },
        L2I_gsl: {
            get() {
                const v = document.app.$data.L2_I_num_lines ?? this.L2_I_num_lines;
                const n = Number(v);
                return Number.isFinite(n) ? n : 32;
            },
            set(v) {
                const n = this.pow2Step(this.prevL2ILC, v, 32, 1024);
                document.app.$data.L2_I_num_lines = n;
                this.$emit('update:L2_I_num_lines', n);
                localStorage.setItem('conf_L2_I_num_lines', n);
                this.prevL2ILC = n;
                if (this.prevL2ILC > this.prevL2I) {
                this.prevL2I = this.prevL2ILC;
                document.app.$data.L2_I_size = this.prevL2ILC;
                this.$emit('update:L2_I_size', n);
                localStorage.setItem('conf_L2_I_size', n);
                }
            }
        },
        L2D_gs: {
            get() {
                const v = document.app.$data.L2_D_size ?? this.L2_D_size;
                const n = Number(v);
                return Number.isFinite(n) ? n : 32;
            },
            set(v) {
                const n = this.pow2Step(this.prevL2D, v, 32, 1024);
                document.app.$data.L2_D_size = n;
                this.$emit('update:L2_D_size', n);
                localStorage.setItem('conf_L2_D_size', n);
                this.prevL2D = n;
                if (this.prevL2D < this.prevL2DLC || this.cache_location === "Associative"){ // Se reduce el numero de líneas por cjto
                this.prevL2DLC = this.prevL2D;
                document.app.$data.L2_D_num_lines = this.prevL2D;
                this.$emit('update:L2_D_num_lines', n);
                localStorage.setItem('conf_L2_D_num_lines', n);
                }
            }
        },
        L2D_gsb: {
            get() {
                const v = document.app.$data.L2_D_size_block ?? this.L2_D_size_block;
                const n = Number(v);
                return Number.isFinite(n) ? n : 32;
            },
            set(v) {
                const n = this.pow2Step(this.prevL2DB, v, 32, 128);
                document.app.$data.L2_D_size_block = n;
                this.$emit('update:L2_D_size_block', n);
                localStorage.setItem('conf_L2_D_size_block', n);
                this.prevL2DB = n;
            }
        },
        L2D_gsl: {
            get() {
                const v = document.app.$data.L2_D_num_lines ?? this.L2_D_num_lines;
                const n = Number(v);
                return Number.isFinite(n) ? n : 32;
            },
            set(v) {
                const n = this.pow2Step(this.prevL2DLC, v, 32, 1024);
                document.app.$data.L2_D_num_lines = n;
                this.$emit('update:L2_D_num_lines', n);
                localStorage.setItem('conf_L2_D_num_lines', n);
                this.prevL2DLC = n;
                if (this.prevL2DLC > this.prevL2D) {
                this.prevL2D = this.prevL2DLC;
                document.app.$data.L2_D_size = this.prevL2DLC;
                this.$emit('update:L2_D_size', n);
                localStorage.setItem('conf_L2_D_size', n);
                }
            }
        },
        L2_gs: {
            get() {
                const v = document.app.$data.L2_size ?? this.L2_size;
                const n = Number(v);
                return Number.isFinite(n) ? n : 32;
            },
            set(v) {
                const n = this.pow2Step(this.prevL2, v, 32, 2048);
                document.app.$data.L2_size = n;
                this.$emit('update:L2_size', n);
                localStorage.setItem('conf_L2_size', n);
                this.prevL2 = n;
                if (this.prevL2 < this.prevL2LC || this.cache_location === "Associative"){ // Se reduce el numero de líneas por cjto
                this.prevL2LC = this.prevL2;
                document.app.$data.L2_num_lines = this.prevL2;
                this.$emit('update:L2_num_lines', n);
                localStorage.setItem('conf_L2_num_lines', n);
                }
            }
        },
        L2_gsb: {
            get() {
                const v = document.app.$data.L2_size_block ?? this.L2_size_block;
                const n = Number(v);
                return Number.isFinite(n) ? n : 32;
            },
            set(v) {
                const n = this.pow2Step(this.prevL2B, v, 32, 128);
                document.app.$data.L2_size_block = n;
                this.$emit('update:L2_size_block', n);
                localStorage.setItem('conf_L2_size_block', n);
                this.prevL2B = n;
            }
        },
        L2_gsl: {
            get() {
                const v = document.app.$data.L2_num_lines ?? this.L2_num_lines;
                const n = Number(v);
                return Number.isFinite(n) ? n : 32;
            },
            set(v) {
                const n = this.pow2Step(this.prevL2LC, v, 32, 2048);
                document.app.$data.L2_num_lines = n;
                this.$emit('update:L2_num_lines', n);
                localStorage.setItem('conf_L2_num_lines', n);
                this.prevL2LC = n;
                if (this.prevL2LC > this.prevL2) {
                this.prevL2 = this.prevL2LC;
                document.app.$data.L2_size = this.prevL2LC;
                this.$emit('update:L2_size', n);
                localStorage.setItem('conf_L2_size', n);
                }
            }
        },
    },

    methods:{
        pow2Step(prev, v, min, max) {
        const cur = Number(prev) || min;
        const target = Number(v);
        let n = cur;
        if (target > cur)       n = cur * 2;           // "+"
        else if (target < cur)  n = Math.floor(cur/2); // "−"
        n = Math.max(min, Math.min(max, n));
        return n;
        },
        // change_policy(value) {
        //     this.cache_policy = value;
        //     this.cache_policy = value;
        //     document.app.$data.cache_policy = value;
        //     localStorage.setItem("cache_policy",
        //         this.cache_policy,
        //     );
        // },
        // change_location(value) {
        //     this.cache_location = value;
        //     this.cache_location = value;
        //     document.app.$data.cache_location = value;
        //     document.app.$data.isDirect = (this.cache_location === "Direct") ? 1 : 0;
        //     localStorage.setItem("cache_policy",
        //         this.cache_location,
        //     );
        //     if (this.cache_location !== "Associative_per_sets") {
        //         this.prevL1LC = this.prevL1;
        //         document.app.$data.L1_num_lines = this.prevL1;
        //         this.$emit('update:L1_num_lines', this.prevL1);
        //         localStorage.setItem('conf_L1_num_lines', this.prevL1);
        //         this.prevL1ILC = this.prevL1I;
        //         document.app.$data.L1_I_num_lines = this.prevL1I;
        //         this.$emit('update:L1_I_num_lines', this.prevL1I);
        //         localStorage.setItem('conf_L1_I_num_lines', this.prevL1I);
        //         this.prevL1DLC = this.prevL1D;
        //         document.app.$data.L1_D_num_lines = this.prevL1D;
        //         this.$emit('update:L1_D_num_lines', this.prevL1D);
        //         localStorage.setItem('conf_L1_D_num_lines', this.prevL1D);
        //         this.prevL2LC = this.prevL2;
        //         document.app.$data.L2_num_lines = this.prevL2;
        //         this.$emit('update:L2_num_lines', this.prevL2);
        //         localStorage.setItem('conf_L2_num_lines', this.prevL2);
        //         this.prevL2ILC = this.prevL2I;
        //         document.app.$data.L2_I_num_lines = this.prevL2I;
        //         this.$emit('update:L2_I_num_lines', this.prevL2I);
        //         localStorage.setItem('conf_L2_I_num_lines', this.prevL2I);
        //         this.prevL2DLC = this.prevL2D;
        //         document.app.$data.L2_D_num_lines = this.prevL2D;
        //         this.$emit('update:L2_D_num_lines', this.prevL2D);
        //         localStorage.setItem('conf_L2_D_num_lines', this.prevL2D);
        //     }
        // },
        // change_cache_architecture(obj: Number){
        // // console.log(obj.target.value);
        //     // this.$props.cachetype = Number();
        //     this.cachetypeForm = Number(obj);
        //     document.app.$data.cachetype = Number(obj);
        //     localStorage.setItem("cachetype",
        //         this.cachetypeForm,
        //     );
        // },
    },
    watch: {
        cachetypeForm(n: Number) {
            const v = Number(n);

            document.app.$data.cache_type = v;
            localStorage.setItem("cachetype", String(v));

        },
        cachetype(n: Number){
            const v = Number(n);

            if (v !== this.cachetypeForm)
                this.cachetypeForm = v;
        },
        cache_policyForm(n: Number) {
            const v = Number(n);

            document.app.$data.cache_policy = v;
            localStorage.setItem("cache_policy", String(v));
        },

        cache_policy(n: Number) {
            const v = Number(n);

            if (v !== this.cache_policyForm)
                this.cache_policyForm = v;
        },
        cache_locationForm(n: String) {
            const v = String(n);
            document.app.$data.cache_location = v;
            document.app.$data.isDirect = (v === "Direct") ? 1 : 0;
            // localStorage.setItem("cache_policy",
            //     this.cache_location,
            // );
            if (v !== "Associative_per_sets") {
                this.prevL1LC = this.prevL1;
                document.app.$data.L1_num_lines = this.prevL1;
                this.$emit('update:L1_num_lines', this.prevL1);
                localStorage.setItem('conf_L1_num_lines', this.prevL1);
                this.prevL1ILC = this.prevL1I;
                document.app.$data.L1_I_num_lines = this.prevL1I;
                this.$emit('update:L1_I_num_lines', this.prevL1I);
                localStorage.setItem('conf_L1_I_num_lines', this.prevL1I);
                this.prevL1DLC = this.prevL1D;
                document.app.$data.L1_D_num_lines = this.prevL1D;
                this.$emit('update:L1_D_num_lines', this.prevL1D);
                localStorage.setItem('conf_L1_D_num_lines', this.prevL1D);
                this.prevL2LC = this.prevL2;
                document.app.$data.L2_num_lines = this.prevL2;
                this.$emit('update:L2_num_lines', this.prevL2);
                localStorage.setItem('conf_L2_num_lines', this.prevL2);
                this.prevL2ILC = this.prevL2I;
                document.app.$data.L2_I_num_lines = this.prevL2I;
                this.$emit('update:L2_I_num_lines', this.prevL2I);
                localStorage.setItem('conf_L2_I_num_lines', this.prevL2I);
                this.prevL2DLC = this.prevL2D;
                document.app.$data.L2_D_num_lines = this.prevL2D;
                this.$emit('update:L2_D_num_lines', this.prevL2D);
                localStorage.setItem('conf_L2_D_num_lines', this.prevL2D);
            }
        }
        },
        cache_location(n: String) {
            const v = String(n);
            
            if (v !== this.cache_locationForm)
                this.cache_locationForm = v;

            

    }
});

</script>

<template>
    <div>
        <b-container fluid>
            <b-row><b-col cols="2"></b-col>
                <b-col cols="3"> <!-- Left side -->

                    <!-- Cache arch select menu -->
                    <b-row> 
                        <b-list-group style="width: 90%;">
                            <b-list-group-item class="justify-content-between align-items-center m-1"> 
                                <label for="range-5">Cache Architecture:</label> 
                                <b-form-radio-group
                                                v-model="cachetypeForm"  
                                                :options="cache_architectures"  
                                                size="md"
                                                title="Cache Architecture"
                                                stacked> 
                                </b-form-radio-group>
                            </b-list-group-item> 
                        </b-list-group>
                    </b-row>

                    <b-row>

                        <!-- Location policy menu -->
                        <b-list-group style="width: 90%;">
                            <b-list-group-item class="justify-content-between align-items-center m-1"> 
                                <label for="range-5">Cache Location:</label> 
                                <b-form-radio-group v-model="cache_locationForm"  
                                                    :options="cache_locations"  
                                                    size="md" 
                                                    title="Cache Location"
                                                    stacked> 
                                </b-form-radio-group> 
                            </b-list-group-item> 
                        </b-list-group>
                    </b-row>

                    <b-row>
                        <!--  Replacement policy menu  -->
                        <b-list-group  style="width: 90%;">
                            <b-list-group-item class="justify-content-between align-items-center m-1" v-if="cache_location != 'Direct'"> 
                                <label for="range-5" v-if="cache_location != 'Direct'">Cache Policy:</label> 
                                <b-form-radio-group v-model="cache_policyForm"  
                                                    :options="cache_policies"  
                                                    size="md" 
                                                    v-if="cache_location != 'Direct'" 
                                                    title="Cache Policy"
                                                    stacked> 
                                </b-form-radio-group> 
                            </b-list-group-item> 
                        </b-list-group>
                    </b-row>
                </b-col>

                <b-col cols="7"> <!-- Right side -->
                    
                        <b-list-group class="justify-content-between align-items-left m-1">
                        <label for="range-5" class="justify-content-between align-items-center m-1">Cache Sizes:</label>
                        <b-list-group-item v-if="cachetype == 0 || cachetype == 2 || cachetype == 4" style="width: 40%;padding-bottom: 5%;">
                            <label v-if="cachetype == 0 || cachetype == 2 || cachetype == 4" for="range-5">L1 lines:</label>
                            <b-form-spinbutton id="L1_size"
                                        v-model="L1_gs" 
                                        v-if="cachetype == 0 || cachetype == 2 || cachetype == 4"
                                        min="32" 
                                        max="2048" 
                                        step="1" 
                                        title="L1 size">
                            </b-form-spinbutton>
                        
                            <label v-if="cache_location == 'Associative_per_sets' && (cachetype == 0 || cachetype == 2 || cachetype == 4)" for="range-5">L1 lines per set:</label>
                            <b-form-spinbutton id="L1_lines" key="spin-L1LC"
                                v-if="cache_location == 'Associative_per_sets' && (cachetype == 0 || cachetype == 2 || cachetype == 4)" 
                                v-model="L1_gsl" 
                                min="32"
                                max="1024"
                                step="32" 
                                title="L1 lines">
                            </b-form-spinbutton>

                            <label v-if="cachetype == 0 || cachetype == 2 || cachetype == 4" for="range-9">Data Block Cache L1 Size:</label>
                            <b-input-group>
                                <b-form-spinbutton id="range-7"
                                        v-model="L1_gsb" 
                                        v-if="cachetype == 0 || cachetype == 2 || cachetype == 4"
                                        min="32" 
                                        max="128" 
                                        step="32" 
                                        title="Data Block Cache L1 Size">
                                </b-form-spinbutton>
                            </b-input-group>
                        </b-list-group-item>

                        <b-list-group-item v-if="cachetype == 1 || cachetype == 3 || cachetype == 5" style="width: 40%;padding-bottom: 5%">
                            <label v-if="cachetype == 1 || cachetype == 3 || cachetype == 5" for="range-5">L1_I lines:</label>
                            <b-form-spinbutton id="L1_I_size" key="spin-L1I"
                                                v-if="cachetype == 1 || cachetype == 3 || cachetype == 5" 
                                                v-model="L1I_gs" 
                                                min="32"
                                            max="1024"
                                            step="32" 
                                            title="L1_I size">
                            </b-form-spinbutton>
                        
                            <label v-if="cache_location == 'Associative_per_sets' && (cachetype == 1 || cachetype == 3 || cachetype == 5)" for="range-5">L1_I lines per set:</label>
                            <b-form-spinbutton id="L1_I_lines" key="spin-L1ILC"
                                            v-if="cache_location === 'Associative_per_sets' && (cachetype == 1 || cachetype == 3 || cachetype == 5)" 
                                            v-model="L1I_gsl" 
                                            min="32"
                                            max="1024"
                                            step="32" 
                                            title="L1_I lines">
                            </b-form-spinbutton>
                    
                            <label v-if="cachetype == 1 || cachetype == 3 || cachetype == 5" for="range-9">Data Block Cache L1_I Size:</label>
                            <b-input-group>
                                <b-form-spinbutton id="range-7"
                                            v-model="L1I_gsb" 
                                            v-if="cachetype == 1 || cachetype == 3 || cachetype == 5"
                                            min="32" 
                                            max="128" 
                                            step="32" 
                                            title="Data Block Cache L1_I Size">
                                </b-form-spinbutton>
                            </b-input-group>
                        </b-list-group-item>

                        <b-list-group-item v-if="cachetype == 1 || cachetype == 3 || cachetype == 5" style="width: 40%;padding-bottom: 5%">

                            <label v-if="cachetype == 1 || cachetype == 3 || cachetype == 5" for="range-5">L1_D lines:</label>
                            <b-form-spinbutton id="L1_D_size" key="spin-L1D" v-if="cachetype == 1 || cachetype == 3 || cachetype == 5" v-model="L1D_gs" min="32" max="1024" step="32" title="L1_D size"></b-form-spinbutton>
                        
                            <label v-if="cache_location == 'Associative_per_sets' && (cachetype == 1 || cachetype == 3 || cachetype == 5)" for="range-5">L1_D lines per set:</label>
                            <b-form-spinbutton id="L1_D_lines" key="spin-L1DLC"
                                            v-if="cache_location == 'Associative_per_sets' && (cachetype == 1 || cachetype == 3 || cachetype == 5)" 
                                            v-model="L1D_gsl" 
                                            min="32"
                                            max="1024"
                                            step="32" 
                                            title="L1_D lines">
                            </b-form-spinbutton>
                    
                            <label v-if="cachetype == 1 || cachetype == 3 || cachetype == 5" for="range-9">Data Block Cache L1_D Size:</label>
                            <b-input-group>
                                <b-form-spinbutton id="range-7"
                                            v-model="L1D_gsb" 
                                            v-if="cachetype == 1 || cachetype == 3 || cachetype == 5"
                                            min="32" 
                                            max="128" 
                                            step="32" 
                                            title="Data Block Cache L1_D Size">
                                </b-form-spinbutton>
                            </b-input-group>
                        </b-list-group-item>
                        
                        <b-list-group-item v-if="cachetype == 2 || cachetype == 3" style="width: 40%;padding-bottom: 5%">
                            <label v-if="cachetype == 2 || cachetype == 3" for="range-5">L2 lines:</label>
                            <b-form-spinbutton id="L2_size"
                                            v-model="L2_gs" 
                                            v-if="cachetype == 2 || cachetype == 3"
                                            min="32" 
                                            max="2048" 
                                            step="1" 
                                            title="L2 size">
                            </b-form-spinbutton>
                
                            <label v-if="cache_location == 'Associative_per_sets' && (cachetype == 2 || cachetype == 3)" for="range-5">L2 lines per set:</label>
                            <b-form-spinbutton id="L2_lines" key="spin-L2LC"
                                                v-if="cache_location == 'Associative_per_sets' && (cachetype == 2 || cachetype == 3)" 
                                                v-model="L2_gsl" 
                                                min="32"
                                                max="1024"
                                                step="32" 
                                                title="L2 lines">
                            </b-form-spinbutton>

                            <label v-if="cachetype == 2 || cachetype == 3" for="range-9">Data Block Cache L2 Size:</label>
                            <b-input-group>
                                <b-form-spinbutton id="range-7"
                                            v-model="L2_gsb" 
                                            v-if="cachetype == 2 || cachetype == 3"
                                            min="32" 
                                            max="128" 
                                            step="32" 
                                            title="Data Block Cache L2 Size">
                                </b-form-spinbutton>
                            </b-input-group>
                        </b-list-group-item>
                        
                        <b-list-group-item v-if="cachetype == 4 || cachetype == 5" style="width: 40%;padding-bottom: 5%">
                            <label v-if="cachetype == 4 || cachetype == 5" for="range-5">L2_I lines:</label>
                            <b-form-spinbutton id="L2_I_size" key="spin-L2I" v-if="cachetype == 4 || cachetype == 5" v-model="L2I_gs" min="32" max="1024" step="32" title="L2_I size"></b-form-spinbutton>
                    
                            <label v-if="cache_location == 'Associative_per_sets' && (cachetype == 4 || cachetype == 5)" for="range-5">L2_I lines per set:</label>
                            <b-form-spinbutton id="L2_I_lines" key="spin-L2ILC"
                                            v-if="cache_location == 'Associative_per_sets' && (cachetype == 4 || cachetype == 5)" 
                                            v-model="L2I_gsl" 
                                            min="32"
                                            max="1024"
                                            step="32" 
                                            title="L2_I lines">
                            </b-form-spinbutton>

                            <label v-if="cachetype == 4 || cachetype == 5" for="range-9">Data Block Cache L2_I Size:</label>
                            <b-input-group>
                                <b-form-spinbutton id="range-7"
                                        v-model="L2I_gsb" 
                                        v-if="cachetype == 4 || cachetype == 5"
                                        min="32" 
                                        max="128" 
                                        step="32" 
                                        title="Data Block Cache L2_I Size">
                                </b-form-spinbutton>
                            </b-input-group>
                        
                        </b-list-group-item>
                        
                        <!-- L2_D con key + proxy -->
                        <b-list-group-item v-if="cachetype == 4 || cachetype == 5" style="width: 40%;padding-bottom: 5%">

                        <label v-if="cachetype == 4 || cachetype == 5" for="range-5">L2_D lines:</label>
                        <b-form-spinbutton id="L2_D_size" key="spin-L2D" v-if="cachetype == 4 || cachetype == 5" v-model="L2D_gs" min="32" max="1024" step="32" title="L2_D size"></b-form-spinbutton>
                        <label v-if="cache_location == 'Associative_per_sets' && (cachetype == 4 || cachetype == 5)" for="range-5">L2_D lines per set:</label>
                        <b-form-spinbutton id="L2_D_lines" key="spin-L2DLC"
                                            v-if="cache_location == 'Associative_per_sets' && (cachetype == 4 || cachetype == 5)" 
                                            v-model="L2D_gsl" 
                                            min="32"
                                            max="1024"
                                            step="32"
                                            title="L2_D lines">
                        </b-form-spinbutton>
                        <label v-if="cachetype == 4 || cachetype == 5" for="range-9">Data Block Cache L2_D Size:</label>
                        <b-input-group>
                            <b-form-spinbutton id="range-7"
                                        v-model="L2D_gsb" 
                                        v-if="cachetype == 4 || cachetype == 5"
                                        min="32" 
                                        max="128" 
                                        step="32" 
                                        title="Data Block Cache L2_D Size">
                            </b-form-spinbutton>
                        </b-input-group>
                        </b-list-group-item>
                        
                    </b-list-group>

                </b-col>
            </b-row>
        </b-container>

    </div>
</template>