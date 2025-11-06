/**
 * Monaco Editor Semantic Validation for Assembly Code
 * 
 * This module provides real-time semantic validation by integrating
 * the CREATOR compiler with Monaco Editor's diagnostic markers system.
 */

import * as monaco from "monaco-editor"
import type { ArchitectureConfig } from "./languages/generic"
import { assemblerMap } from "@/web/assemblers"

/**
 * Error information extracted from compiler output
 */
interface CompilerError {
  message: string
  startLine: number
  startColumn: number
  endLine: number
  endColumn: number
  severity: monaco.MarkerSeverity
  code?: string
}

/**
 * Linter information from compiler
 */
interface LinterInfo {
  errorText: string
  line: number
  column: number
}

/**
 * Linter information type - can be a single error or an array of errors
 */
type LinterData = LinterInfo | LinterInfo[]

/**
 * Debounce timer for validation
 */
let validationTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Compiler result type
 */
interface CompilerResult {
  status: string
  msg?: string
  linter?: LinterData
  [key: string]: unknown
}

/**
 * Compiler function type
 */
type CompilerFunction = (code: string, library: boolean) => Promise<CompilerResult> | CompilerResult

/**
 * Get the appropriate compiler function for the current architecture
 * 
 * @param architecture - Current architecture configuration
 * @returns The compiler function to use
 */
function getCompilerFunction(architecture?: ArchitectureConfig): CompilerFunction {
  // Get assemblers from architecture config
  const assemblers = (architecture?.config as { assemblers?: Array<{ name: string }> })?.assemblers || []
  
  // Use the first assembler from the architecture config, or default to CreatorCompiler
  const defaultAssembler = assemblers.length > 0 ? assemblers[0]?.name : "CreatorCompiler"
  
  const compiler = assemblerMap[defaultAssembler ?? "CreatorCompiler"]
  // Always return CreatorCompiler as fallback since it's guaranteed to exist
  return compiler ?? (assemblerMap.CreatorCompiler as CompilerFunction)
}

/**
 * Validate assembly code and update Monaco markers
 * 
 * @param editor - Monaco editor instance
 * @param code - Assembly code to validate
 * @param architecture - Current architecture configuration
 */
export async function validateAssemblyCode(
  editor: monaco.editor.IStandaloneCodeEditor,
  code: string,
  architecture?: ArchitectureConfig
): Promise<void> {
  const model = editor.getModel()
  if (!model) return
  
  // Clear existing markers
  monaco.editor.setModelMarkers(model, "creator-validation", [])
  
  // Skip validation if code is empty
  if (!code.trim()) return
  
  // Skip validation if no architecture is loaded
  if (!architecture) return
  
  // Get the appropriate compiler function for this architecture
  const compilerFunction = getCompilerFunction(architecture)
  
  try {
    // Compile the code to check for errors
    const result = await compilerFunction(code, false)
    
    // If compilation failed, parse and display errors
    if (result.status === "error") {
      const markers: monaco.editor.IMarkerData[] = []
      
      // Check if the compiler provided linter information (new format)
      if (result.linter) {
        // Handle both single error and array of errors
        const linterErrors = Array.isArray(result.linter) ? result.linter : [result.linter]
        
        for (const linterError of linterErrors) {
          // If column is 1 (no column info), highlight the entire line
          // Otherwise, highlight just the specific position
          const shouldHighlightFullLine = linterError.column === 1
          const lineContent = model.getLineContent(linterError.line)
          const lineLength = lineContent.length
          
          markers.push({
            severity: monaco.MarkerSeverity.Error,
            message: linterError.errorText || "Compilation error",
            startLineNumber: linterError.line,
            startColumn: shouldHighlightFullLine ? 1 : linterError.column,
            endLineNumber: linterError.line,
            endColumn: shouldHighlightFullLine ? lineLength + 1 : linterError.column + 1,
            source: "CREATOR Compiler",
          })
        }
      } 
      
      if (markers.length > 0) {
        monaco.editor.setModelMarkers(model, "creator-validation", markers)
      }
    }
  } catch (error) {
    // Handle unexpected errors during validation
    console.error("Error during semantic validation:", error)
  }
}

/**
 * Setup semantic validation for an editor instance
 * 
 * This function sets up automatic validation that triggers as the user types,
 * with a debounce delay to avoid excessive compilation attempts.
 * 
 * @param editor - Monaco editor instance
 * @param architecture - Current architecture configuration
 * @param debounceMs - Debounce delay in milliseconds (default: 1000ms)
 * @returns Disposable to clean up the validation listener
 */
export function setupSemanticValidation(
  editor: monaco.editor.IStandaloneCodeEditor,
  architecture?: ArchitectureConfig,
  debounceMs: number = 1000
): monaco.IDisposable {
  // Validate immediately on setup
  const code = editor.getValue()
  if (code.trim()) {
    validateAssemblyCode(editor, code, architecture).catch(err => {
      console.error("Initial validation error:", err)
    })
  }
  
  // Setup listener for content changes
  const disposable = editor.onDidChangeModelContent(() => {
    // Clear previous timer
    if (validationTimer) {
      clearTimeout(validationTimer)
    }
    
    // Set new validation timer
    validationTimer = setTimeout(() => {
      const currentCode = editor.getValue()
      validateAssemblyCode(editor, currentCode, architecture).catch(err => {
        console.error("Validation error:", err)
      })
    }, debounceMs)
  })
  
  return disposable
}

/**
 * Clear all validation markers from an editor
 * 
 * @param editor - Monaco editor instance
 */
export function clearValidationMarkers(editor: monaco.editor.IStandaloneCodeEditor): void {
  const model = editor.getModel()
  if (model) {
    monaco.editor.setModelMarkers(model, "creator-validation", [])
  }
}
