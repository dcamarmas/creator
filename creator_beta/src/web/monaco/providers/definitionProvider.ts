/**
 * Copyright 2018-2025 CREATOR Team.
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

/**
 * Helper function to check if a position in a line is inside a comment
 */
function isInsideComment(
    line: string,
    position: number,
    commentPrefix: string = "#",
): boolean {
    const commentIndex = line.indexOf(commentPrefix);
    return commentIndex !== -1 && position >= commentIndex;
}

/**
 * Generates a definition provider that allows jumping to label definitions
 */
export function generateDefinitionProvider(): monaco.languages.DefinitionProvider {
    return {
        provideDefinition: (model, position) => {
            // Get the word at the current position
            const word = model.getWordAtPosition(position);
            if (!word) return null;

            const wordText = word.word;

            // Check if we're inside a comment - if so, don't provide definition
            const lineContent = model.getLineContent(position.lineNumber);
            if (isInsideComment(lineContent, word.startColumn - 1)) {
                return null;
            }

            // Search for label definitions in the document
            // Labels are defined as: labelName:
            const text = model.getValue();
            const lines = text.split("\n");

            const definitions: monaco.languages.Location[] = [];

            // Look for label definitions (format: "labelName:")
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (!line) continue;

                const lineNumber = i + 1;

                // Match label definitions: optional whitespace, then identifier, then colon
                // Also handle labels that might have comments after them
                const labelMatch = line.match(
                    /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/,
                );

                if (labelMatch && labelMatch[1] === wordText) {
                    const labelName = labelMatch[1];
                    const startColumn = line.indexOf(labelName);

                    // Make sure the label is not inside a comment
                    if (!isInsideComment(line, startColumn)) {
                        const column = startColumn + 1;
                        const endColumn = column + labelName.length;

                        definitions.push({
                            uri: model.uri,
                            range: new monaco.Range(
                                lineNumber,
                                column,
                                lineNumber,
                                endColumn,
                            ),
                        });
                    }
                }
            }

            return definitions.length > 0 ? definitions : null;
        },
    };
}

/**
 * Generates a reference provider that finds all references to a label
 */
export function generateReferenceProvider(): monaco.languages.ReferenceProvider {
    return {
        provideReferences: (model, position, context) => {
            // Get the word at the current position
            const word = model.getWordAtPosition(position);
            if (!word) return null;

            const wordText = word.word;

            // Check if we're inside a comment - if so, don't provide references
            const lineContent = model.getLineContent(position.lineNumber);
            if (isInsideComment(lineContent, word.startColumn - 1)) {
                return null;
            }

            // Search for both label definitions and references
            const text = model.getValue();
            const lines = text.split("\n");

            const references: monaco.languages.Location[] = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (!line) continue;

                const lineNumber = i + 1;

                // Match label definitions (labelName:)
                const labelDefMatch = line.match(
                    /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/,
                );
                if (labelDefMatch && labelDefMatch[1] === wordText) {
                    const labelName = labelDefMatch[1];
                    const startColumn = line.indexOf(labelName);

                    // Make sure the label is not inside a comment
                    if (!isInsideComment(line, startColumn)) {
                        const column = startColumn + 1;
                        const endColumn = column + labelName.length;

                        if (context.includeDeclaration) {
                            references.push({
                                uri: model.uri,
                                range: new monaco.Range(
                                    lineNumber,
                                    column,
                                    lineNumber,
                                    endColumn,
                                ),
                            });
                        }
                    }
                }

                // Match label references (anywhere in the line after the label definition)
                // This includes cases like: la a0, labelName  or  beq a0, a1, labelName
                const regex = new RegExp(`\\b${wordText}\\b`, "g");
                let match: RegExpExecArray | null;

                while ((match = regex.exec(line)) !== null) {
                    const matchStart = match.index;

                    // Skip if this match is inside a comment
                    if (isInsideComment(line, matchStart)) {
                        continue;
                    }

                    // Skip if this is a label definition (already handled above)
                    const isDefinition =
                        line.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/) &&
                        matchStart < line.indexOf(":");

                    if (!isDefinition) {
                        const startColumn = matchStart + 1;
                        const endColumn = startColumn + wordText.length;

                        references.push({
                            uri: model.uri,
                            range: new monaco.Range(
                                lineNumber,
                                startColumn,
                                lineNumber,
                                endColumn,
                            ),
                        });
                    }
                }
            }

            return references.length > 0 ? references : null;
        },
    };
}

/**
 * Generates a document symbol provider for outlining labels
 */
export function generateDocumentSymbolProvider(): monaco.languages.DocumentSymbolProvider {
    return {
        provideDocumentSymbols: model => {
            const text = model.getValue();
            const lines = text.split("\n");

            const symbols: monaco.languages.DocumentSymbol[] = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (!line) continue;

                const lineNumber = i + 1;

                // Match label definitions
                const labelMatch = line.match(
                    /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/,
                );

                if (labelMatch && labelMatch[1]) {
                    const labelName = labelMatch[1];
                    const startColumn = line.indexOf(labelName);

                    // Make sure the label is not inside a comment
                    if (!isInsideComment(line, startColumn)) {
                        const column = startColumn + 1;
                        const endColumn = column + labelName.length;

                        symbols.push({
                            name: labelName,
                            detail: "Label",
                            kind: monaco.languages.SymbolKind.Function,
                            tags: [],
                            range: new monaco.Range(
                                lineNumber,
                                1,
                                lineNumber,
                                line.length + 1,
                            ),
                            selectionRange: new monaco.Range(
                                lineNumber,
                                column,
                                lineNumber,
                                endColumn,
                            ),
                        });
                    }
                }
            }

            return symbols;
        },
    };
}
