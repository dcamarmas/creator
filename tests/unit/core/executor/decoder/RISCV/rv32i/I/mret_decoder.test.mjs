import { decode_test, RV32IMFD_INT_PATH } from "../../common.mjs";

Deno.test("decode - mret instruction", () =>
    decode_test("00110000001000000000000001110011", "mret", RV32IMFD_INT_PATH),
);
