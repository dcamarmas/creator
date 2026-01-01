/**
 * Copyright 2018-2026 CREATOR Team.
 *
 * This file is part of CREATOR.
 *
 * CREATOR is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * CREATOR is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as monaco from "monaco-editor";
import { generateLanguageDefinition, type ArchitectureConfig } from "./generic";
import { registerZ80Language } from "./z80";

// Keep track of registered languages to avoid duplicate registrations
const registeredLanguages = new Set<string>();

// Register custom languages that have hardcoded definitions
// This is done once on module load
(() => {
    registerZ80Language();
})();

/**
 * Register assembly language with Monaco Editor based on loaded architecture
 *
 * Language ID determination:
 * - If config.syntax is NOT set: uses architecture name (normalized to lowercase, spaces→hyphens)
 *   Example: "RV32" → "rv32", "MIPS 32" → "mips-32"
 * - If config.syntax IS set: uses that value
 *   - "plaintext": disables syntax highlighting/completions
 *   - Custom value: allows using pre-registered language or custom syntax
 *
 * @param architecture The loaded architecture configuration
 */
export function registerAssemblyLanguages(architecture?: ArchitectureConfig) {
    // If no architecture provided, just ensure Monaco is ready
    if (!architecture) {
        return;
    }

    const architectureName = architecture?.config?.name || "Assembly";

    // Determine language ID:
    // 1. If syntax is explicitly set, use it (could be custom language or "plaintext")
    // 2. Otherwise, use architecture name (normalized to lowercase and spaces to hyphens)
    const languageId = architecture?.config?.syntax
        ? architecture.config.syntax
        : architectureName.toLowerCase().replace(/\s+/g, "-");

    // Skip if already registered
    if (registeredLanguages.has(languageId)) {
        return;
    }

    try {
        // If syntax is set to "plaintext", use built-in plaintext instead of registering custom language
        if (architecture?.config?.syntax === "plaintext") {
            registeredLanguages.add(languageId);
            console.log(`Using plaintext mode for: ${architectureName}`);
            return;
        }

        // If a custom language is already registered (like z80), just mark it and skip
        const monacoLanguages = monaco.languages.getLanguages();
        if (monacoLanguages.some(lang => lang.id === languageId)) {
            registeredLanguages.add(languageId);
            console.log(
                `Using pre-registered custom language for: ${architectureName} (${languageId})`,
            );
            return;
        }

        // Generate language definition from architecture
        const langDef = generateLanguageDefinition(architecture);

        // Register the language
        monaco.languages.register({
            id: languageId,
            extensions: [".s", ".asm"],
            aliases: [architectureName, languageId],
        });

        // Set the language configuration
        monaco.languages.setLanguageConfiguration(languageId, langDef.config);

        // Set the tokens provider (syntax highlighting)
        monaco.languages.setMonarchTokensProvider(
            languageId,
            langDef.tokensProvider,
        );

        // Register completion provider
        monaco.languages.registerCompletionItemProvider(
            languageId,
            langDef.completionProvider,
        );

        // Register hover provider
        monaco.languages.registerHoverProvider(
            languageId,
            langDef.hoverProvider,
        );

        // Register definition provider (for Go to Definition)
        monaco.languages.registerDefinitionProvider(
            languageId,
            langDef.definitionProvider,
        );

        // Register reference provider (for Find All References)
        monaco.languages.registerReferenceProvider(
            languageId,
            langDef.referenceProvider,
        );

        // Register document symbol provider (for outline/breadcrumbs)
        monaco.languages.registerDocumentSymbolProvider(
            languageId,
            langDef.documentSymbolProvider,
        );

        // Mark as registered
        registeredLanguages.add(languageId);

        console.log(
            `Registered Monaco language support for: ${architectureName} (${languageId})`,
        );
    } catch (error) {
        console.error(
            `Failed to register Monaco language for ${architectureName}:`,
            error,
        );
    }
}

/**
 * Update Monaco editor language when architecture changes
 * @param architecture The new architecture configuration
 * @param editor The Monaco editor instance
 */
export function updateEditorLanguage(
    architecture: ArchitectureConfig,
    editor: monaco.editor.IStandaloneCodeEditor | null,
) {
    if (!architecture || !editor) {
        return;
    }

    const architectureName = architecture?.config?.name || "Assembly";

    // Determine language ID (same logic as in registerAssemblyLanguages)
    const languageId = architecture?.config?.syntax
        ? architecture.config.syntax
        : architectureName.toLowerCase().replace(/\s+/g, "-");

    // Register the language if not already registered
    registerAssemblyLanguages(architecture);

    // Update the editor model language
    const model = editor.getModel();
    if (model) {
        monaco.editor.setModelLanguage(model, languageId);
    }
}
