import { CAPI_MEMORY } from "./capi_memory.mjs";
import { CAPI_SYSCALL } from "./capi_syscall.mjs";
import { CAPI_VALIDATION } from "./capi_validation.mjs";
import { CAPI_CHECK_STACK } from "./capi_check_stack.mjs";
import { CAPI_DRAW_STACK } from "./capi_draw_stack.mjs";
import { CAPI_FP } from "./capi_fp.mjs";

// Export all CAPI functions and make them globally available
export function initCAPI() {
    const CAPI = {
        ...CAPI_MEMORY,
        ...CAPI_SYSCALL,
        ...CAPI_VALIDATION,
        ...CAPI_CHECK_STACK,
        ...CAPI_DRAW_STACK,
        ...CAPI_FP,
    };

    // Make functions globally available for eval
    if (typeof window !== "undefined") {
        Object.entries(CAPI).forEach(([key, value]) => {
            window[`capi_${key}`] = value;
        });
    } else {
        Object.entries(CAPI).forEach(([key, value]) => {
            global[`capi_${key}`] = value;
        });
    }

    return CAPI;
}
