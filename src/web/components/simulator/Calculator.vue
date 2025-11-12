<!--
Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso,
                    Alejandro Calderon Mateos, Luis Daniel Casais Mezquida

This file is part of CREATOR.

CREATOR is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

CREATOR is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
-->

<script lang="ts">
import { defineComponent } from "vue"
import {
  float2bin,
  double2bin,
  bin2hex,
  hex2float,
  hex2double,
  float32_to_uint,
  float64_to_uint,
} from "@/core/utils/utils.mjs"

export default defineComponent({
  props: {
    id: { type: String, required: true },
  },

  data() {
    return {
      // Active format: 'ieee32' or 'ieee64'
      format: "ieee32" as "ieee32" | "ieee64",

      // Input values
      decimalInput: "",
      hexInput: "",
      binaryInput: "",

      // Calculated results
      decimalValue: 0,
      hexValue: "",
      binaryValue: "",

      // IEEE 754 breakdown
      sign: "",
      exponent: "",
      mantissa: "",

      // Error state
      error: "",
    }
  },

  computed: {
    formatBits(): number {
      return this.format === "ieee32" ? 32 : 64
    },
    
    signBits(): number {
      return 1
    },

    exponentBits(): number {
      return this.format === "ieee32" ? 8 : 11
    },

    mantissaBits(): number {
      return this.format === "ieee32" ? 23 : 52
    },

    exponentBias(): number {
      return this.format === "ieee32" ? 127 : 1023
    },

    specialValueType(): string {
      if (!this.binaryValue) return ""
      
      const s = this.sign === "1"
      const e = parseInt(this.exponent, 2)
      const m = parseInt(this.mantissa, 2)
      const maxExp = (1 << this.exponentBits) - 1

      if (e === 0 && m === 0) {
        return s ? "-0" : "+0"
      } else if (e === 0) {
        return s ? "-Denormalized" : "+Denormalized"
      } else if (e === maxExp) {
        if (m === 0) {
          return s ? "-Infinity" : "+Infinity"
        } else {
          return "NaN"
        }
      } else {
        return s ? "-Normalized" : "+Normalized"
      }
    },
  },

  methods: {
    convertFromDecimal() {
      try {
        this.error = ""
        const value = parseFloat(this.decimalInput)

        if (isNaN(value)) {
          this.error = "Invalid decimal number"
          return
        }

        this.decimalValue = value

        if (this.format === "ieee32") {
          // Convert to binary
          this.binaryValue = float2bin(value)
          // Convert to hex using the uint representation
          const uintValue = float32_to_uint(value)
          this.hexValue = "0x" + uintValue.toString(16).padStart(8, "0").toUpperCase()
        } else {
          // IEEE 64
          this.binaryValue = double2bin(value)
          const result = float64_to_uint(value)
          const low = result[0] ?? 0
          const high = result[1] ?? 0
          this.hexValue =
            "0x" +
            high.toString(16).padStart(8, "0").toUpperCase() +
            low.toString(16).padStart(8, "0").toUpperCase()
        }

        this.updateBreakdown()
        this.updateInputs()
      } catch (e) {
        this.error = "Error converting decimal: " + (e as Error).message
      }
    },

    convertFromHex() {
      try {
        this.error = ""
        let hexStr = this.hexInput.replace(/^0x/i, "").replace(/\s/g, "")

        if (!/^[0-9a-fA-F]+$/.test(hexStr)) {
          this.error = "Invalid hexadecimal value"
          return
        }

        if (this.format === "ieee32") {
          hexStr = hexStr.padStart(8, "0").substring(0, 8)
          this.decimalValue = hex2float("0x" + hexStr)
          this.binaryValue = float2bin(this.decimalValue)
          this.hexValue = "0x" + hexStr.toUpperCase()
        } else {
          // IEEE 64
          hexStr = hexStr.padStart(16, "0").substring(0, 16)
          this.decimalValue = hex2double("0x" + hexStr)
          this.binaryValue = double2bin(this.decimalValue)
          this.hexValue = "0x" + hexStr.toUpperCase()
        }

        this.updateBreakdown()
        this.updateInputs()
      } catch (e) {
        this.error = "Error converting hexadecimal: " + (e as Error).message
      }
    },

    convertFromBinary() {
      try {
        this.error = ""
        let binStr = this.binaryInput.replace(/\s/g, "")

        if (!/^[01]+$/.test(binStr)) {
          this.error = "Invalid binary value"
          return
        }

        const expectedBits = this.formatBits
        binStr = binStr.padStart(expectedBits, "0").substring(0, expectedBits)

        this.binaryValue = binStr
        
        // Convert binary to hex
        const hexResult = bin2hex(binStr)
        if (hexResult === null) {
          this.error = "Error converting binary to hex"
          return
        }
        
        this.hexValue = "0x" + hexResult.padStart(this.format === "ieee32" ? 8 : 16, "0").toUpperCase()

        // Convert to decimal
        if (this.format === "ieee32") {
          this.decimalValue = hex2float(this.hexValue)
        } else {
          this.decimalValue = hex2double(this.hexValue)
        }

        this.updateBreakdown()
        this.updateInputs()
      } catch (e) {
        this.error = "Error converting binary: " + (e as Error).message
      }
    },

    onBinaryPartChange() {
      // When user edits sign, exponent, or mantissa directly
      try {
        this.error = ""
        
        // Validate each part contains only 0s and 1s
        if (this.sign && !/^[01]*$/.test(this.sign)) {
          this.error = "Sign must be 0 or 1"
          return
        }
        if (this.exponent && !/^[01]*$/.test(this.exponent)) {
          this.error = "Exponent must contain only 0s and 1s"
          return
        }
        if (this.mantissa && !/^[01]*$/.test(this.mantissa)) {
          this.error = "Mantissa must contain only 0s and 1s"
          return
        }

        // Build the full binary value
        const signPart = (this.sign || "0").padStart(1, "0").substring(0, 1)
        const expPart = (this.exponent || "").padStart(this.exponentBits, "0").substring(0, this.exponentBits)
        const mantPart = (this.mantissa || "").padStart(this.mantissaBits, "0").substring(0, this.mantissaBits)
        
        this.binaryValue = signPart + expPart + mantPart

        // Convert to other formats
        const hexResult = bin2hex(this.binaryValue)
        if (hexResult === null) {
          this.error = "Error converting binary to hex"
          return
        }
        
        this.hexValue = "0x" + hexResult.padStart(this.format === "ieee32" ? 8 : 16, "0").toUpperCase()

        // Convert to decimal
        if (this.format === "ieee32") {
          this.decimalValue = hex2float(this.hexValue)
        } else {
          this.decimalValue = hex2double(this.hexValue)
        }

        // Update the input fields
        this.decimalInput = this.decimalValue.toString()
        this.hexInput = this.hexValue
        this.binaryInput = this.binaryValue
      } catch (e) {
        this.error = "Error updating value: " + (e as Error).message
      }
    },

    updateBreakdown() {
      if (!this.binaryValue) return

      this.sign = this.binaryValue.substring(0, 1)
      this.exponent = this.binaryValue.substring(1, 1 + this.exponentBits)
      this.mantissa = this.binaryValue.substring(1 + this.exponentBits)
    },

    updateInputs() {
      this.decimalInput = this.decimalValue.toString()
      this.hexInput = this.hexValue
      this.binaryInput = this.binaryValue
    },

    changeFormat() {
      // Reset on format change
      this.clear()
    },

    clear() {
      this.decimalInput = ""
      this.hexInput = ""
      this.binaryInput = ""
      this.decimalValue = 0
      this.hexValue = ""
      this.binaryValue = ""
      this.sign = ""
      this.exponent = ""
      this.mantissa = ""
      this.error = ""
    },

    copyToClipboard(text: string) {
      navigator.clipboard.writeText(text).then(
        () => {
          // Success - silently copied
          console.log("Copied to clipboard:", text)
        },
        (err) => {
          // Error
          console.error("Failed to copy to clipboard:", err)
        }
      )
    },

    getExponentValue(): number {
      if (!this.exponent) return 0
      return parseInt(this.exponent, 2) - this.exponentBias
    },
  },
})
</script>

<template>
  <b-modal :id="id" title="IEEE 754 Floating Point Converter" size="xl" hide-footer body-class="p-0">
    <div class="calculator-container">
      <!-- Format selector header -->
      <div class="calculator-header">
        <div class="format-selector">
          <button
            :class="['tab', { active: format === 'ieee32' }]"
            @click="format = 'ieee32'; changeFormat()"
          >
            <font-awesome-icon :icon="['fas', 'microchip']" />
            <span>32-bit (Float)</span>
          </button>
          <button
            :class="['tab', { active: format === 'ieee64' }]"
            @click="format = 'ieee64'; changeFormat()"
          >
            <font-awesome-icon :icon="['fas', 'memory']" />
            <span>64-bit (Double)</span>
          </button>
        </div>
        <button class="clear-btn" @click="clear" title="Clear all fields">
          <font-awesome-icon icon="fa-solid fa-trash" />
        </button>
      </div>

      <!-- Error display -->
      <b-alert v-if="error" variant="danger" show dismissible @dismissed="error = ''" class="m-3 mb-0">
        {{ error }}
      </b-alert>

      <!-- Main content -->
      <div class="calculator-content">
        <!-- IEEE 754 Breakdown -->
        <div class="section">
          <div class="section-title">IEEE 754 Breakdown</div>
          
          <!-- Visual representation with editable fields -->
          <div class="ieee-visual">
            <div class="ieee-bit-group sign">
              <div class="ieee-label">Sign</div>
              <b-form-input
                v-model="sign"
                class="ieee-input font-monospace"
                placeholder="0"
                @input="onBinaryPartChange"
                maxlength="1"
                size="sm"
              ></b-form-input>
            </div>
            <div class="ieee-bit-group exponent">
              <div class="ieee-label">Exponent ({{ exponentBits }}b)</div>
              <b-form-input
                v-model="exponent"
                class="ieee-input font-monospace"
                :placeholder="'0'.repeat(exponentBits)"
                @input="onBinaryPartChange"
                :maxlength="exponentBits"
                size="sm"
              ></b-form-input>
            </div>
            <div class="ieee-bit-group mantissa">
              <div class="ieee-label">Mantissa ({{ mantissaBits }}b)</div>
              <b-form-input
                v-model="mantissa"
                class="ieee-input font-monospace"
                :placeholder="'0'.repeat(mantissaBits)"
                @input="onBinaryPartChange"
                :maxlength="mantissaBits"
                size="sm"
              ></b-form-input>
            </div>
          </div>
          <!-- Formula -->
          <div class="formula-box">
            <code class="formula">value = (-1)<sup>sign</sup> × 2<sup>exponent - {{ exponentBias }}</sup> × (1 + mantissa)</code>
          </div>
        </div>

        <!-- Value representations -->
        <div class="section">
          <div class="section-title">Value Representations</div>
          
          <div class="value-inputs">
            <!-- Decimal -->
            <div class="input-row">
              <label class="input-label">Decimal</label>
              <div class="input-wrapper">
                <b-form-input
                  v-model="decimalInput"
                  type="text"
                  placeholder="e.g., 3.14159"
                  @input="convertFromDecimal"
                  size="sm"
                ></b-form-input>
                <button
                  class="copy-btn"
                  @click="copyToClipboard(decimalInput)"
                  title="Copy"
                  :disabled="!decimalInput"
                >
                  <font-awesome-icon icon="fa-solid fa-copy" />
                </button>
              </div>
            </div>

            <!-- Hexadecimal -->
            <div class="input-row">
              <label class="input-label">Hexadecimal</label>
              <div class="input-wrapper">
                <b-form-input
                  v-model="hexInput"
                  type="text"
                  :placeholder="format === 'ieee32' ? 'e.g., 0x40490FDB' : 'e.g., 0x400921FB54442D18'"
                  @input="convertFromHex"
                  class="font-monospace"
                  size="sm"
                ></b-form-input>
                <button
                  class="copy-btn"
                  @click="copyToClipboard(hexInput)"
                  title="Copy"
                  :disabled="!hexInput"
                >
                  <font-awesome-icon icon="fa-solid fa-copy" />
                </button>
              </div>
            </div>

            <!-- Binary -->
            <div class="input-row">
              <label class="input-label">Binary</label>
              <div class="input-wrapper">
                <b-form-input
                  v-model="binaryInput"
                  type="text"
                  :placeholder="format === 'ieee32' ? '32-bit binary' : '64-bit binary'"
                  @input="convertFromBinary"
                  class="font-monospace"
                  size="sm"
                  style="font-size: 0.75rem"
                ></b-form-input>
                <button
                  class="copy-btn"
                  @click="copyToClipboard(binaryInput)"
                  title="Copy"
                  :disabled="!binaryInput"
                >
                  <font-awesome-icon icon="fa-solid fa-copy" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<style scoped lang="scss">
@import "@/web/scss/tab-buttons.scss";

.calculator-container {
  display: flex;
  flex-direction: column;
  height: 70vh;
  max-height: 600px;
  overflow: hidden;
}

.calculator-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
  background: var(--bs-body-bg);
}

.format-selector {
  display: flex;
  gap: 4px;
  flex: 1;
}

.clear-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  background: color-mix(in srgb, currentColor 10%, transparent);
  color: rgba(0, 0, 0, 0.8);
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  font-size: 0.875rem;

  &:hover {
    background: color-mix(in srgb, currentColor 15%, transparent);
  }

  &:active {
    background: color-mix(in srgb, currentColor 25%, transparent);
  }
}

.calculator-content {
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;

    &:hover {
      background-color: rgba(0, 0, 0, 0.3);
    }
  }
}

.section {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.8);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ieee-visual {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  overflow-x: auto;
  padding-bottom: 4px;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;

    &:hover {
      background-color: rgba(0, 0, 0, 0.3);
    }
  }
}

.ieee-bit-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  min-width: fit-content;

  &.sign {
    background: color-mix(in srgb, #ffc107 15%, transparent);
    border-color: color-mix(in srgb, #ffc107 30%, transparent);
    flex: 0 0 80px;
  }

  &.exponent {
    background: color-mix(in srgb, #0d6efd 12%, transparent);
    border-color: color-mix(in srgb, #0d6efd 25%, transparent);
    flex: 1 1 auto;
    min-width: 150px;
  }

  &.mantissa {
    background: color-mix(in srgb, #198754 12%, transparent);
    border-color: color-mix(in srgb, #198754 25%, transparent);
    flex: 2 1 auto;
    min-width: 200px;
  }
}

.ieee-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  text-align: center;
}

.ieee-input {
  font-size: 0.75rem;
  font-family: "SF Mono", "Monaco", "Inconsolata", "Fira Code", monospace;
  padding: 4px 6px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: white;
  text-align: center;
  transition: all 150ms;

  &:focus {
    border-color: var(--bs-primary);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--bs-primary) 15%, transparent);
  }
}


.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8125rem;
  gap: 8px;

  .label {
    font-weight: 600;
    color: rgba(0, 0, 0, 0.7);
    flex-shrink: 0;
  }

  .value {
    text-align: right;
    color: rgba(0, 0, 0, 0.9);
    word-break: break-all;

    &.small-text {
      font-size: 0.7rem;
    }
  }
}

.formula-box {
  padding: 10px 12px;
  background: color-mix(in srgb, var(--bs-info) 10%, transparent);
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--bs-info) 20%, transparent);
  text-align: center;
}

.formula {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.9);
  display: block;
}

.value-inputs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin: 0;
}

.input-wrapper {
  display: flex;
  gap: 6px;
  align-items: center;

  input {
    flex: 1;
    font-size: 0.875rem;
    padding: 6px 8px;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    transition: all 150ms;

    &:focus {
      border-color: var(--bs-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--bs-primary) 15%, transparent);
    }
  }
}

.copy-btn {
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  background: color-mix(in srgb, currentColor 10%, transparent);
  color: rgba(0, 0, 0, 0.7);
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  font-size: 0.875rem;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background: color-mix(in srgb, currentColor 15%, transparent);
    color: rgba(0, 0, 0, 0.9);
  }

  &:active:not(:disabled) {
    background: color-mix(in srgb, currentColor 25%, transparent);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

// Dark theme support
[data-bs-theme="dark"] {
  .calculator-header {
    border-bottom-color: rgba(255, 255, 255, 0.12);
  }

  .calculator-content {
    &::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.2);

      &:hover {
        background-color: rgba(255, 255, 255, 0.3);
      }
    }
  }

  .section-title {
    color: rgba(255, 255, 255, 0.9);
  }

  .ieee-visual {
    &::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.2);

      &:hover {
        background-color: rgba(255, 255, 255, 0.3);
      }
    }
  }

  .ieee-bit-group {
    border-color: rgba(255, 255, 255, 0.1);
  }

  .ieee-label {
    color: rgba(255, 255, 255, 0.9);
  }

  .ieee-input {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(0, 0, 0, 0.3);
    color: rgba(255, 255, 255, 0.9);
  }

  .input-label {
    color: rgba(255, 255, 255, 0.7);
  }

  .input-wrapper input {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(0, 0, 0, 0.2);
    color: rgba(255, 255, 255, 0.9);
  }

  .info-row {
    .label {
      color: rgba(255, 255, 255, 0.7);
    }

    .value {
      color: rgba(255, 255, 255, 0.9);
    }
  }

  .formula {
    color: rgba(255, 255, 255, 0.9);
  }

  .clear-btn,
  .copy-btn {
    color: rgba(255, 255, 255, 0.8);

    &:hover:not(:disabled) {
      color: rgba(255, 255, 255, 0.95);
    }
  }
}

// Responsive
@media (max-width: 768px) {
  .ieee-visual {
    flex-direction: column;
  }

  .ieee-bit-group {
    min-width: 100% !important;
    
    &.sign,
    &.exponent,
    &.mantissa {
      flex: 1 1 auto;
    }
  }

}
</style>
