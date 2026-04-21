import { useState, useEffect } from "react"

interface WebGPUState {
  checking: boolean
  supported: boolean
  adapter: GPUAdapter | null
}

// Module-level cache: probe runs once per page load.
// Second call to useWebGPU() returns the cached result instantly.
let cached: { supported: boolean; adapter: GPUAdapter | null } | null = null

export function useWebGPU(): WebGPUState {
  const [state, setState] = useState<WebGPUState>(() => {
    if (cached) return { checking: false, ...cached }
    return { checking: true, supported: false, adapter: null }
  })

  useEffect(() => {
    if (cached) return

    async function probe() {
      if (!navigator.gpu) {
        cached = { supported: false, adapter: null }
        setState({ checking: false, supported: false, adapter: null })
        return
      }
      try {
        const adapter = await navigator.gpu.requestAdapter()
        if (!adapter) {
          cached = { supported: false, adapter: null }
          setState({ checking: false, supported: false, adapter: null })
        } else {
          cached = { supported: true, adapter }
          setState({ checking: false, supported: true, adapter })
        }
      } catch {
        cached = { supported: false, adapter: null }
        setState({ checking: false, supported: false, adapter: null })
      }
    }

    probe()
  }, [])

  return state
}
