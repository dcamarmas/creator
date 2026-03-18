import { ARCH, execution_tests } from "../arch_utils.mts";

execution_tests(
    ARCH.riscv,
    "riscv/error/executor",
    undefined,
    new Set([
        "test_riscv_error_executor_002.s",
        "test_riscv_error_executor_003.s",
        "test_riscv_error_executor_004.s",
        "test_riscv_error_executor_005.s",
        "test_riscv_error_executor_006.s",
        "test_riscv_error_executor_007.s",
        "test_riscv_error_executor_008.s",
    ]),
);
