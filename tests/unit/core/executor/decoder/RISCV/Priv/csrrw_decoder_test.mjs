import { decode_test, RV32IMFD_INT_PATH } from "../common.mjs";

Deno.test("decode - csrrw instruction", () =>
    decode_test("00110100001000000001000001110011", "csrrw x0, MCAUSE, x0", RV32IMFD_INT_PATH),
);
    