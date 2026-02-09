'use client'

import { createContext, type ReactNode, useContext, useMemo, useState } from 'react'

type SidebarContextType = {
  open: boolean
  setOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }
  return context
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  const value = useMemo(() => ({ open, setOpen }), [open])

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}
