import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ServicePackage {
  id: string
  name: string
  description?: string | null
  price: number
  features: string[]
}

interface PricingSectionProps {
  servicePackages: ServicePackage[]
  hotline: string
}

export default function PricingSection({ servicePackages, hotline }: PricingSectionProps) {
  return (
    <section className="bg-black py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-2 text-center text-3xl font-bold md:text-4xl">GIÁ CẢ</h2>
        <p className="mb-12 text-center text-gray-400">Lựa chọn gói dịch vụ phù hợp với nhu cầu của bạn</p>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          {servicePackages.map((pkg) => (
            <div
              key={pkg.id}
              className="rounded-lg bg-zinc-800 p-8 flex flex-col h-full border border-zinc-700 hover:border-red-500 transition-shadow hover:shadow-lg"
            >
              <h3 className="mb-2 text-2xl font-bold text-white">{pkg.name}</h3>
              <div
                className="mb-6 text-gray-400"
                dangerouslySetInnerHTML={{ __html: pkg.description || "Gói dịch vụ" }}
              />
              <div className="mb-6 flex items-baseline justify-center">
                <span className="text-4xl font-extrabold text-green-400">{pkg.price.toLocaleString('vi-VN')}</span>
                <span className="ml-2 text-gray-400 text-lg">VNĐ</span>
              </div>
              <ul className="mb-8 space-y-4 flex-grow">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="mr-3 h-5 w-5 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-red-500 py-6 text-lg hover:bg-red-600 mt-auto">Chọn Gói</Button>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-xl font-semibold">Liên hệ trực tiếp</p>
          <p className="text-2xl font-bold text-green-500">{hotline}</p>
        </div>
      </div>
    </section>
  )
}