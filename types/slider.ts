export interface Slider {
  id: string
  title: string
  subtitle: string | null
  url: string
  link: string | null
  isActive: boolean
  order: number
  buttonText: string | null
  mobileUrl: string | null
  description: string | null
  createdAt: Date
  updatedAt: Date
}