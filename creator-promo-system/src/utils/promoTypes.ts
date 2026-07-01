import type { PromoThemeName } from '../theme/theme'

export type SceneKind = 'hero' | 'problem' | 'category' | 'feature' | 'flow' | 'ending'

export type PromoScene = {
  id: string
  kind: SceneKind
}

export type ProblemItem = {
  label: string
  checked?: boolean
}

export type CategoryItem = {
  label: string
  note?: string
  icon: IconName
}

export type FeatureRole = {
  id: string
  label: string
  note: string
  fields: FeatureField[]
}

export type FeatureField = {
  id: string
  label: string
  kind: 'text' | 'select' | 'checkbox' | 'date'
  value: string
  options?: string[]
  checked?: boolean
  width?: 'full' | 'half'
}

export type FlowStep = {
  label: string
  note: string
}

export type PromoData = {
  slug: string
  title: string
  subtitle: string
  url: string
  status: string
  theme: PromoThemeName
  scenes: PromoScene[]
  hero: {
    title: string
    product: string
    status: string
  }
  problem: {
    title: string
    items: ProblemItem[]
    message: string
  }
  category: {
    title: string
    categories: CategoryItem[]
  }
  feature: {
    title: string
    subtitle: string
    workspaceTitle: string
    workspaceStatus: string
    tabs: string[]
    savedLabel: string
    documentEyebrow: string
    documentTitle: string
    roles: FeatureRole[]
  }
  flow: {
    title: string
    steps: FlowStep[]
  }
  ending: {
    title: string
    product: string
    url: string
    status: string
  }
}

export type IconName =
  | 'briefcase'
  | 'camera'
  | 'check'
  | 'clipboard'
  | 'copy'
  | 'file'
  | 'image'
  | 'layers'
  | 'layout'
  | 'mic'
  | 'monitor'
  | 'pen'
  | 'spark'
  | 'video'
  | 'wand'
