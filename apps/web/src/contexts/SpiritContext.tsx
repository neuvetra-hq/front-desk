import { createContext, useContext } from 'react'

interface SpiritContextValue {
  transition: (preset: string) => void
  toggleMute: () => boolean
}

export const SpiritContext = createContext<SpiritContextValue>({
  transition: () => {},
  toggleMute: () => false,
})

export const useSpiritContext = () => useContext(SpiritContext)
