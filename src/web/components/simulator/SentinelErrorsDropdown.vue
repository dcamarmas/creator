<!--
Copyright 2018-2025 CREATOR Team.

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

<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import { ref, computed } from "vue";

interface SentinelViolation {
  rule: string;
  register?: string;
  message: string;
}

interface SentinelError {
  functionName: string;
  violations: SentinelViolation[];
  timestamp: string;
}

// Props
interface Props {
  dark: boolean;
}

const _props = defineProps<Props>();

// State
const errors = ref<SentinelError[]>([]);
const maxErrors = 50; // Limit stored errors to prevent memory issues

// Computed
const hasErrors = computed(() => errors.value.length > 0);
const errorCount = computed(() => errors.value.length);
const totalViolations = computed(() =>
  errors.value.reduce((sum: number, err) => sum + err.violations.length, 0),
);

// Helper functions
const getRuleIcon = (rule: string): string => {
  switch (rule) {
    case "SAVE_BEFORE_USE":
      return "exclamation-triangle";
    case "RESTORE_REQUIRED":
      return "arrow-rotate-left";
    case "RESTORE_ADDRESS_MISMATCH":
      return "location-crosshairs";
    case "SIZE_MISMATCH":
      return "ruler";
    case "VALUE_NOT_RESTORED":
      return "file-circle-xmark";
    case "STACK_NOT_RESTORED":
      return "layer-group";
    default:
      return "circle-exclamation";
  }
};

const getRuleVariant = (rule: string) => {
  switch (rule) {
    case "SAVE_BEFORE_USE":
    case "RESTORE_REQUIRED":
    case "VALUE_NOT_RESTORED":
    case "STACK_NOT_RESTORED":
      return "danger";
    case "RESTORE_ADDRESS_MISMATCH":
    case "SIZE_MISMATCH":
      return "warning";
    default:
      return "info";
  }
};

const getRuleDescription = (rule: string): string => {
  switch (rule) {
    case "SAVE_BEFORE_USE":
      return "Saved register used before being saved to memory";
    case "RESTORE_REQUIRED":
      return "Saved register was not restored before function return";
    case "RESTORE_ADDRESS_MISMATCH":
      return "Register restored from different address than saved";
    case "SIZE_MISMATCH":
      return "Save and restore operations used different sizes";
    case "VALUE_NOT_RESTORED":
      return "Register value was not properly restored";
    case "STACK_NOT_RESTORED":
      return "Stack pointer was not restored to original value";
    default:
      return "Calling convention violation";
  }
};

const parseErrorMessage = (msg: string): SentinelViolation[] => {
  const violations: SentinelViolation[] = [];
  const lines = msg.split("\n").filter(line => line.trim().startsWith("-"));

  for (const line of lines) {
    const message = line.replace(/^\s*-\s*/, "").trim();

    // Try to determine the rule type from the message
    let rule = "UNKNOWN";
    let register: string | undefined = undefined;

    if (message.includes("saved but never restored")) {
      rule = "RESTORE_REQUIRED";
    } else if (message.includes("used but never saved")) {
      rule = "SAVE_BEFORE_USE";
    } else if (message.includes("modified before being saved")) {
      rule = "SAVE_BEFORE_USE";
    } else if (
      message.includes("saved at") &&
      message.includes("restored from")
    ) {
      rule = "RESTORE_ADDRESS_MISMATCH";
    } else if (message.includes("bytes but restored with")) {
      rule = "SIZE_MISMATCH";
    } else if (message.includes("value changed but not properly restored")) {
      rule = "VALUE_NOT_RESTORED";
    } else if (message.includes("Stack pointer not restored")) {
      rule = "STACK_NOT_RESTORED";
    }

    // Extract register name if present
    const registerMatch = message.match(/Register (\w+)/);
    if (registerMatch) {
      register = registerMatch[1];
    }

    violations.push({ rule, register, message });
  }

  return violations;
};

// Methods
const addError = (functionName: string, violations: SentinelViolation[]) => {
  const timestamp = new Date().toLocaleTimeString();

  errors.value.unshift({
    functionName,
    violations,
    timestamp,
  });

  // Limit the number of stored errors
  if (errors.value.length > maxErrors) {
    errors.value = errors.value.slice(0, maxErrors);
  }
};

const clearErrors = () => {
  errors.value = [];
};

const getViolationsByFunction = (functionName: string): SentinelViolation[] => {
  const error = errors.value.find(e => e.functionName === functionName);
  return error ? error.violations : [];
};

// Public method to be called from parent when sentinel.leave() is called
const checkForErrors = (
  result: { ok: boolean; msg: string },
  functionName: string,
) => {
  if (!result.ok && result.msg) {
    // Parse the error message to extract violations
    const violations = parseErrorMessage(result.msg);
    addError(functionName, violations);
  }
};

// Expose methods to parent
defineExpose({
  addError,
  clearErrors,
  checkForErrors,
  getViolationsByFunction,
});
</script>

<template>
  <b-nav-item-dropdown
    class="sentinel-dropdown"
    :class="{ 'has-errors': hasErrors, 'dark-theme': dark }"
    no-caret
    right
  >
    <template #button-content>
      <font-awesome-icon
        :icon="['fas', 'shield-halved']"
        :class="{ 'text-danger': hasErrors, 'text-success': !hasErrors }"
      />
      <b-badge v-if="hasErrors" :variant="'danger'" pill class="error-badge">
        {{ errorCount }}
      </b-badge>
    </template>
    <div class="sentinel-dropdown-content" @click.stop>
      <!-- Header -->
      <div class="sentinel-header">
        <div class="sentinel-title">
          <font-awesome-icon
            :icon="['fas', 'shield-halved']"
            class="me-2"
            :class="{ 'text-danger': hasErrors, 'text-success': !hasErrors }"
          />
          <span class="fw-bold">Calling Convention</span>
        </div>

        <div class="sentinel-stats">
          <b-badge
            :variant="hasErrors ? 'danger' : 'success'"
            pill
            class="me-2"
          >
            {{ errorCount }} {{ errorCount === 1 ? "error" : "errors" }}
          </b-badge>
          <b-badge v-if="hasErrors" variant="warning" pill class="me-2">
            {{ totalViolations }}
            {{ totalViolations === 1 ? "violation" : "violations" }}
          </b-badge>
          <b-button
            v-if="hasErrors"
            size="sm"
            variant="outline-secondary"
            @click.stop="clearErrors"
          >
            <font-awesome-icon :icon="['fas', 'trash']" />
          </b-button>
        </div>
      </div>

      <!-- Content -->
      <div class="sentinel-content">
        <div v-if="!hasErrors" class="no-errors-message">
          <font-awesome-icon
            :icon="['fas', 'circle-check']"
            size="2x"
            class="text-success mb-2"
          />
          <p class="text-muted mb-0">No violations detected</p>
        </div>

        <div v-else class="errors-list">
          <b-card
            v-for="(error, index) in errors"
            :key="index"
            class="error-card mb-2"
            :class="{ 'dark-card': dark }"
          >
            <!-- Function header -->
            <template #header>
              <div class="d-flex justify-content-between align-items-center">
                <div class="function-info">
                  <font-awesome-icon
                    :icon="['fas', 'function']"
                    class="me-2 text-primary"
                  />
                  <strong>{{ error.functionName }}</strong>
                </div>

                <div class="error-meta">
                  <b-badge variant="secondary" pill class="me-2">
                    {{ error.timestamp }}
                  </b-badge>
                  <b-badge variant="danger" pill>
                    {{ error.violations.length }}
                  </b-badge>
                </div>
              </div>
            </template>

            <!-- Violations list -->
            <b-list-group flush>
              <b-list-group-item
                v-for="(violation, vIndex) in error.violations"
                :key="vIndex"
                class="violation-item"
                :variant="getRuleVariant(violation.rule) as any"
              >
                <div class="d-flex align-items-start">
                  <font-awesome-icon
                    :icon="['fas', getRuleIcon(violation.rule)]"
                    class="me-2 mt-1 violation-icon"
                  />
                  <div class="violation-details flex-grow-1">
                    <div
                      class="violation-header d-flex justify-content-between align-items-start mb-1"
                    >
                      <strong class="violation-rule">{{
                        violation.rule.replace(/_/g, " ")
                      }}</strong>
                      <b-badge
                        v-if="violation.register"
                        variant="secondary"
                        class="ms-2"
                      >
                        {{ violation.register }}
                      </b-badge>
                    </div>

                    <p class="violation-description text-muted mb-1">
                      <em>{{ getRuleDescription(violation.rule) }}</em>
                    </p>

                    <p class="violation-message mb-0">
                      {{ violation.message }}
                    </p>
                  </div>
                </div>
              </b-list-group-item>
            </b-list-group>
          </b-card>
        </div>
      </div>
    </div>
  </b-nav-item-dropdown>
</template>

<style lang="scss" scoped>
.sentinel-dropdown {
  position: relative;

  &.has-errors {
    :deep(.nav-link) {
      position: relative;
    }
  }

  .error-badge {
    position: absolute;
    top: 2px;
    right: -2px;
    font-size: 0.65rem;
    min-width: 18px;
    height: 18px;
    padding: 2px 4px;
    line-height: 14px;
  }

  :deep(.dropdown-menu) {
    min-width: 500px;
    max-width: 600px;
    max-height: 80vh;
    overflow: hidden;
    padding: 0;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }
}

.sentinel-dropdown-content {
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

.sentinel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--bs-light);
  border-bottom: 1px solid var(--bs-border-color);

  .dark-theme & {
    background: #2d2d2d;
    border-bottom-color: #404040;
  }
}

.sentinel-title {
  display: flex;
  align-items: center;
  font-size: 0.95rem;
}

.sentinel-stats {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sentinel-content {
  overflow-y: auto;
  max-height: calc(80vh - 60px);

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bs-secondary-bg);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--bs-border-color);
    border-radius: 4px;

    &:hover {
      background: var(--bs-secondary);
    }
  }
}

.no-errors-message {
  text-align: center;
  padding: 2rem 1rem;
}

.errors-list {
  padding: 1rem;
}

.error-card {
  border: 1px solid var(--bs-border-color);

  &.dark-card {
    background: #2d2d2d;
    border-color: #404040;

    :deep(.card-header) {
      background: #363636;
      border-bottom-color: #404040;
    }
  }

  :deep(.card-header) {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }

  :deep(.card-body) {
    padding: 0;
  }
}

.function-info {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.error-meta {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
}

.violation-item {
  padding: 0.75rem;
  background: transparent;
  border: none;
  border-left: 4px solid transparent;
  font-size: 0.85rem;

  &.list-group-item-danger {
    border-left-color: var(--bs-danger);
    background: rgba(var(--bs-danger-rgb), 0.05);
  }

  &.list-group-item-warning {
    border-left-color: var(--bs-warning);
    background: rgba(var(--bs-warning-rgb), 0.05);
  }

  &.list-group-item-info {
    border-left-color: var(--bs-info);
    background: rgba(var(--bs-info-rgb), 0.05);
  }
}

.violation-icon {
  flex-shrink: 0;
}

.violation-details {
  min-width: 0;
}

.violation-rule {
  font-size: 0.85rem;
  text-transform: capitalize;
}

.violation-description {
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.violation-message {
  font-family: "SF Mono", "Consolas", "Monaco", "Courier New", monospace;
  font-size: 0.8rem;
  line-height: 1.3;
  word-wrap: break-word;
}

// Responsive
@media (max-width: 768px) {
  .sentinel-dropdown {
    :deep(.dropdown-menu) {
      min-width: 90vw;
      max-width: 90vw;
    }
  }

  .sentinel-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .error-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
