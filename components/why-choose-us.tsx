import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function WhyChooseUs() {
  const benefits = [
    "Kỹ thuật viên được chứng nhận",
    "Dịch vụ sửa chữa toàn diện",
    "900 Đánh giá năm sao",
    "Bảo hành sửa chữa",
  ]

  return (
    <section className="bg-black py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-6 text-4xl font-bold uppercase">
              Tại sao lại chọn
              <br />
              chúng tôi
            </h2>
            <p className="mb-8 text-gray-400">
              Chúng tôi luôn mang đến lợi ích cho bạn thế nên chuyên môn cao, cũng như sự tâm huyết của chúng tôi, chỉ
              mong nhận được sự hài lòng của bạn
            </p>
            <ul className="mb-8 space-y-6">
              {benefits.map((benefit, index) => (
                <li key={index} className="text-xl font-semibold">
                  {benefit}
                </li>
              ))}
            </ul>
            <Button className="bg-red-600 px-8 py-6 text-lg font-semibold text-white hover:bg-red-700">XEM THÊM</Button>
          </div>
          <div className="relative">
            <div className="absolute -right-4 -top-4 h-full w-full border-t-4 border-r-4 border-red-600"></div>
            <div className="relative h-full w-full overflow-hidden">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-NCSOIMt5tVcwqSPMHUlqhrxp8aitCf.png"
                alt="Motorcycle mechanic"
                width={600}
                height={500}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-8 right-8 h-20 w-20 rounded-full bg-white p-2">
                <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-red-600">
                  <span className="text-xl font-bold text-red-600">HT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

