import { ARCH, execution_tests, compile_error_tests } from "../arch_utils.mts";

execution_tests(
    ARCH.mips,
    "mips/error/executor",
    undefined,
    new Set([
        "test_mips_error_executor_002.s",
        "test_mips_error_executor_003.s",
        "test_mips_error_executor_004.s",
        "test_mips_error_executor_005.s",
        "test_mips_error_executor_006.s",
        "test_mips_error_executor_007.s",
        "test_mips_error_executor_008.s",
        "test_mips_error_executor_009.s",
    ]),
);

compile_error_tests(ARCH.mips, "mips/error/compiler")
