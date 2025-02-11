import assert from 'assert';
import {

// Language: javascript
  checkTypeIEEE,
  hex2char8,
  hex2float,
  uint_to_float32,
  float32_to_uint,
  uint_to_float64,
  float64_to_uint,
  float2bin,
  double2bin,
  bin2hex,
  hex2double,
  full_print,
  clean_string
} from '../../../../src/core/utils/utils.mjs';

describe('utils.mjs', function () {

  describe('checkTypeIEEE', function () {
    it('should return 16 for s=0,e=0,m=0 (positive zero)', function () {
      // 1<<4 equals 16
      assert.strictEqual(checkTypeIEEE(0, 0, 0), 16);
    });
    it('should return 8 for s=1,e=0,m=0 (negative zero)', function () {
      // 1<<3 equals 8
      assert.strictEqual(checkTypeIEEE(1, 0, 0), 8);
    });
    it('should return 5<<? for normalized positive: s=0,e nonzero, m nonzero', function () {
      // For s=0 and e!=0 and e != 255, expect 1<<6 (i.e. 64) from last else clause.
      assert.strictEqual(checkTypeIEEE(0, 100, 1), 64);
    });
    it('should return 2<<? for normalized negative: s=1,e nonzero, m nonzero', function () {
      // For s=1 and e!=0 and e !=255, expect 1<<1 which is 2.
      assert.strictEqual(checkTypeIEEE(1, 100, 1), 2);
    });
  });

  describe('hex2char8', function () {
    it('should convert a hex string to spaced characters', function () {
      // "48656c6c6f" -> "H e l l o "
      const hexStr = "48656c6c6f";
      const expected = "H e l l o ";
      assert.strictEqual(hex2char8(hexStr), expected);
    });
  });

  describe('hex2float', function () {
    it('should convert hex representation to float (pi approx)', function () {
      // 0x40490FDB corresponds approximately to 3.1415927 in float.
      const hexVal = "0x40490FDB";
      const result = hex2float(hexVal);
      assert(Math.abs(result - 3.1415927) < 1e-6);
    });
  });

  describe('uint_to_float32 and float32_to_uint', function () {
    it('should round-trip conversion of float32 via uint', function () {
      const number = 1.5;
      const uintVal = float32_to_uint(number);
      const floatVal = uint_to_float32(uintVal);
      assert(Math.abs(floatVal - number) < 1e-6);
    });
  });

  describe('uint_to_float64 and float64_to_uint', function () {
    it('should round-trip conversion of float64 via uint array', function () {
      const number = 2.718281828459045;
      // Convert double to uint representation array, then back.
      const uintArr = float64_to_uint(number);
      // uint_to_float64 takes two 32-bit values:
      const floatVal = uint_to_float64(uintArr[0], uintArr[1]);
      assert(Math.abs(floatVal - number) < 1e-12);
    });
  });

  describe('float2bin and double2bin', function () {
    it('should return 32-bit binary string for float2bin', function () {
      const number = 1.0;
      const binStr = float2bin(number);
      assert.strictEqual(binStr.length, 32);
    });
    it('should return 64-bit binary string for double2bin', function () {
      const number = 1.0;
      const binStr = double2bin(number);
      assert.strictEqual(binStr.length, 64);
    });
  });

  describe('bin2hex', function () {
    it('should convert binary string to hexadecimal', function () {
      // Example: "1111" -> "F"
      const binStr = "1111";
      const hex = bin2hex(binStr);
      assert.strictEqual(hex, "F");
    });
    it('should return an object with valid: false for invalid binary input', function () {
      const invalidStr = "1020";
      const result = bin2hex(invalidStr);
      assert.strictEqual(result.valid, false);
    });
  });

  describe('hex2double', function () {
    it('should convert hex representation to double (pi approx)', function () {
      // 0x400921FB54442D18 corresponds approximately to 3.141592653589793 in double.
      const hexVal = "0x400921FB54442D18";
      const result = hex2double(hexVal);
      assert(Math.abs(result - 3.141592653589793) < 1e-12);
    });
  });

  describe('clean_string', function () {
    it('should prepend prefix to numeric only strings', function () {
      const input = "12345";
      const expected = "pre12345";
      assert.strictEqual(clean_string(input, "pre"), expected);
    });
    it('should not change non numeric strings without numbers only', function () {
      const input = "abc123";
      assert.strictEqual(clean_string(input, "pre"), "abc123");
    });
  });

});