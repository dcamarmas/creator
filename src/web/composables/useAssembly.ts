import { ref, readonly } from 'vue'
import { assembly_compile, reset, status, architecture } from "@/core/core.mjs"
import { resetStats } from "@/core/executor/stats.mts"
import { instructions } from "@/core/assembler/assembler.mjs"
import { show_notification, storeBackup } from "@/web/utils.mjs"
import { assemblerMap, getDefaultCompiler } from "@/web/assemblers"

export interface AssemblyResult {
  type: 'success' | 'error' | 'warning'
  msg?: string
  token?: string
  bgcolor?: string
}

export interface AssemblyCompileResult {
  type?: string
  status?: string
  msg?: string
  token?: string
  bgcolor?: string
}

export interface UseAssemblyOptions {
  onSuccess?: (result: AssemblyResult) => void
  onError?: (result: AssemblyResult) => void
  onWarning?: (result: AssemblyResult) => void
  resetSimulator?: boolean
  switchToSimulator?: boolean
  emitAssemblyEvent?: boolean
}

export function useAssembly(options: UseAssemblyOptions = {}) {
  const {
    onSuccess,
    onError,
    onWarning,
    resetSimulator = true,
    switchToSimulator = false,
    emitAssemblyEvent = false
  } = options

  const compiling = ref(false)
  const isAssembled = ref(false)

  const resetSimulatorState = () => {
    if (!resetSimulator) return

    const root = (document as any).app as {
      keyboard: string
      display: string
      enter: null
    }
    if (root) {
      root.keyboard = ""
      root.display = ""
      root.enter = null
    }
    reset()
  }

  const resetExecutionStats = () => {
    resetStats()
    status.executedInstructions = 0
    status.clkCycles = 0
  }

  const handleAssemblyResult = (ret: AssemblyCompileResult): AssemblyResult => {
    const rawType = ret.type || (ret.status === 'ok' ? 'success' : 'error')
    const result: AssemblyResult = {
      type: (rawType === 'success' || rawType === 'error' || rawType === 'warning')
        ? rawType as 'success' | 'error' | 'warning'
        : 'error',
      msg: ret.msg,
      token: ret.token,
      bgcolor: ret.bgcolor
    }

    switch (result.type) {
      case 'error':
        onError?.(result)
        break
      case 'warning':
        onWarning?.(result)
        break
      default:
        // Success case
        // Put rowVariant in entrypoint
        const entrypoint = instructions.at(status.execution_index)
        if (entrypoint) {
          entrypoint._rowVariant = "success"
        }
        isAssembled.value = true
        // Reset to normal after 2 seconds
        setTimeout(() => {
          isAssembled.value = false
        }, 2000)

        if (switchToSimulator) {
          // This would be handled by the component using the composable
        }

        onSuccess?.(result)
        
        // Emit event to force refresh of instructions table
        if (emitAssemblyEvent) {
          const root = (document as any).app as { $emit: (event: string) => void; assemblyCompletedKey: number }
          if (root) {
            // Increment the key to force re-render of components that depend on instructions
            root.assemblyCompletedKey = (root.assemblyCompletedKey || 0) + 1
          }
        }
    }

    return result
  }

  const assemble = async (
    code: string,
    compilerName?: string
  ): Promise<AssemblyResult> => {
    resetSimulatorState()
    resetExecutionStats()

    compiling.value = true

    try {
      // Get assembler function
      const compiler = compilerName || getDefaultCompiler(architecture)
      const assemblerFn = assemblerMap[compiler]

      // Assemble the code
      const ret = await (assemblerFn
        ? assembly_compile(code, assemblerFn)
        : assembly_compile(code))

      const result = handleAssemblyResult(ret)

      // Store backup after assembly
      storeBackup()

      return result
    } finally {
      compiling.value = false
    }
  }

  return {
    compiling: readonly(compiling),
    isAssembled: readonly(isAssembled),
    assemble
  }
}