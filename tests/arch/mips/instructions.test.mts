import { ARCH, execution_tests } from "../arch_utils.mts";

execution_tests(
    ARCH.mips,
    "mips/instructions",
    undefined,
    new Set(["test_mips_instruction_058.s", "test_mips_instruction_064.s"]),
);
