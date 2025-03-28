import { Slider } from "@/types/slider"
import { SliderDisplay } from "@/components/slider/slider-display"

interface HeroProps {
  sliders: Slider[]
}

export default function Hero({ sliders }: HeroProps) {
  // Add any additional hero section logic here if needed
  return <SliderDisplay sliders={sliders} />
}