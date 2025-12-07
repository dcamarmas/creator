import { decode_test, RV32IMFD_INT_PATH } from "../../common.mjs";

Deno.test("decode - ebreak instruction", () =>
    decode_test("00000000000100000000000001110011", "ebreak", RV32IMFD_INT_PATH),
);
