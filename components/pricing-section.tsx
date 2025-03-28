import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PricingSection() {
  const basicFeatures = ["Kiểm tra tổng quát", "Thay dầu nhớt", "Kiểm tra hệ thống phanh", "Kiểm tra áp suất lốp"]

  const premiumFeatures = [
    "Tất cả dịch vụ cơ bản",
    "Kiểm tra và điều chỉnh ECU",
    "Vệ sinh buồng đốt",
    "Kiểm tra và thay thế phụ tùng",
    "Bảo hành 12 tháng",
  ]

  return (
    <section className="bg-zinc-900 py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-2 text-center text-3xl font-bold md:text-4xl">GIÁ CẢ</h2>
        <p className="mb-12 text-center text-gray-400">Lựa chọn gói dịch vụ phù hợp với nhu cầu của bạn</p>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
          {/* Basic Plan */}
          <div className="rounded-lg bg-zinc-800 p-8 flex flex-col h-full">
            <h3 className="mb-2 text-2xl font-bold">Gói Cơ Bản</h3>
            <p className="mb-6 text-gray-400">Dành cho bảo dưỡng định kỳ</p>
            <div className="mb-6 flex items-baseline">
              <span className="text-4xl font-bold">500.000</span>
              <span className="ml-2 text-gray-400">VNĐ</span>
            </div>
            <ul className="mb-8 space-y-4 flex-grow">
              {basicFeatures.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="mr-3 h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full bg-red-500 py-6 text-lg hover:bg-red-600">Chọn Gói</Button>
          </div>

          {/* Premium Plan */}
          <div className="rounded-lg bg-zinc-800 p-8 flex flex-col h-full">
            <h3 className="mb-2 text-2xl font-bold">Gói Cao Cấp</h3>
            <p className="mb-6 text-gray-400">Dành cho sửa chữa toàn diện</p>
            <div className="mb-6 flex items-baseline">
              <span className="text-4xl font-bold">1.500.000</span>
              <span className="ml-2 text-gray-400">VNĐ</span>
            </div>
            <ul className="mb-8 space-y-4 flex-grow">
              {premiumFeatures.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="mr-3 h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full bg-red-500 py-6 text-lg hover:bg-red-600">Chọn Gói</Button>
          </div>
        </div>
        <div className="mt-12 text-center">
          <p className="text-xl font-semibold">Liên hệ trực tiếp</p>
          <p className="text-2xl font-bold text-green-500">0905.678.910</p>
        </div>
      </div>
    </section>
  )
}