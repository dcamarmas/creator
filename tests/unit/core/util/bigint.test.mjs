import assert from 'assert';
import {
  bi_intToBigInt,
  bi_floatToBigInt,
  bi_BigIntTofloat,
  bi_doubleToBigInt,
  bi_BigIntTodouble,
  register_value_deserialize
} from '../../../../src/core/utils/bigint.mjs';

// For these tests we assume that the register size is 32 bits.
// In particular, BigInt.asUintN(32, BigInt(-1)) yields 4294967295n.
const REGISTER_SIZE = 32n; 
const UINT32_MAX = 2n ** 32n; 

describe('bigint.mjs', function () {
  
  describe('bi_intToBigInt', function () {
    it('should convert a positive integer correctly', function () {
      const input = 123;
      const result = bi_intToBigInt(input, 10);
      // For a positive number below 2^32, the value remains the same.
      assert.strictEqual(result, BigInt(input));
    });
    
    it('should correctly normalize a negative integer', function () {
      const input = -1;
      const result = bi_intToBigInt(input, 10);
      // Normalizing -1 to unsigned 32-bit yields 2^32 - 1.
      assert.strictEqual(result, UINT32_MAX - 1n);
    });
  });
  
  describe('bi_floatToBigInt and bi_BigIntTofloat', function () {
    it('should round-trip a float value', function () {
      const floatVal = 3.14;
      const bigIntVal = bi_floatToBigInt(floatVal);
      const floatRoundTrip = bi_BigIntTofloat(bigIntVal);
      // Due to floating-point representation, allow a small delta.
      assert(Math.abs(floatVal - floatRoundTrip) < 1e-6);
    });
  });
  
  describe('bi_doubleToBigInt and bi_BigIntTodouble', function () {
    it('should round-trip a double value', function () {
      const doubleVal = 3.141592653589793;
      const bigIntVal = bi_doubleToBigInt(doubleVal);
      const doubleRoundTrip = bi_BigIntTodouble(bigIntVal);
      assert(Math.abs(doubleVal - doubleRoundTrip) < 1e-12);
    });
  });
  
  describe('register_value_deserialize', function () {
    it('should deserialize non-floating point register values', function () {
      const architecture = {
        components: [
          {
            type: 'gp_registers',
            double_precision: false,
            elements: [
              {
                value: "123",
                default_value: "456"
              }
            ]
          }
        ]
      };
      
      const deserializedArch = register_value_deserialize(architecture);
      // For non-fp registers, the values are converted using bi_intToBigInt.
      assert.strictEqual(typeof deserializedArch.components[0].elements[0].value, 'bigint');
      assert.strictEqual(deserializedArch.components[0].elements[0].value, BigInt(123));
      assert.strictEqual(typeof deserializedArch.components[0].elements[0].default_value, 'bigint');
      assert.strictEqual(deserializedArch.components[0].elements[0].default_value, BigInt(456));
    });
    
    it('should deserialize floating point register values', function () {
      const architecture = {
        components: [
          {
            type: 'fp_registers',
            double_precision: false,
            elements: [
              {
                value: 3.14,
                default_value: 2.718
              }
            ]
          }
        ]
      };
      
      const deserializedArch = register_value_deserialize(architecture);
      // For fp registers, values are processed with bi_floatToBigInt.
      const floatVal = bi_BigIntTofloat(deserializedArch.components[0].elements[0].value);
      const floatDefault = bi_BigIntTofloat(deserializedArch.components[0].elements[0].default_value);
      assert(Math.abs(floatVal - 3.14) < 1e-6);
      assert(Math.abs(floatDefault - 2.718) < 1e-6);
    });
  });
});