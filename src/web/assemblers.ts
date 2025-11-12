/**
 * Central registry for all available assemblers.
 * This is the single source of truth for assembler mappings.
 */

import { rasmAssemble } from "@/core/assembler/rasm/web/rasm.mjs"
import { assembleCreator } from "@/core/assembler/creatorAssembler/web/creatorAssembler.mjs"

/**
 * Assembler function type - flexible to accommodate different assembler signatures
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AssemblerFunction = (...args: any[]) => Promise<any>

/**
 * Map of assembler names to their implementation functions
 */
export const assemblerMap: Record<string, AssemblerFunction> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CreatorCompiler: assembleCreator as any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RASM: rasmAssemble as any,
}

/**
 * Architecture type with minimal required properties
 */
interface ArchitectureConfig {
  config?: {
    assemblers?: Array<{ name?: string }>
  }
}

/**
 * Get the default compiler name from the architecture configuration
 * @param architecture - The architecture object
 * @returns The default compiler name
 */
export function getDefaultCompiler(architecture: ArchitectureConfig): string {
  const assemblers = architecture?.config?.assemblers || []
  return assemblers.length > 0 ? (assemblers[0]?.name ?? "CreatorCompiler") : "CreatorCompiler"
}
