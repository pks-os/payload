import type { LabelFunction } from 'payload/server'

export type StepNavItem = {
  label: LabelFunction | Record<string, string> | string
  url?: string
}

export type ContextType = {
  setStepNav: (items: StepNavItem[]) => void
  stepNav: StepNavItem[]
}