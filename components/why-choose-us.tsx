import Image from "next/image"
import { Button } from "@/components/ui/button"
import prisma from "@/lib/db"

export default async function WhyChooseUs() {
  // Fetch about data from database
  const aboutData = await prisma.about.findFirst({
    select: {
      title: true,
      content: true,
      images: {
        take: 1
      }
    }
  })

  const benefits = [
    "Đội ngũ kỹ thuật viên được đào tạo chuyên nghiệp",
    "Trang thiết bị và công cụ hiện đại", 
    "Phụ tùng chính hãng 100%",
    "Bảo hành dài hạn cho mọi dịch vụ"
  ]

  return (
    <section className="bg-black py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            {/* Remove uppercase and font-bold from title to preserve Word formatting */}
            <h2 className="mb-6 text-4xl">
              {aboutData?.title || "Tại sao lại chọn chúng tôi"}
            </h2>
            {/* Remove text-gray-400 to preserve Word text color */}
            <div 
              className="mb-8"
              dangerouslySetInnerHTML={{
                __html: aboutData?.content || ""
              }}
            />
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
                src={aboutData?.images?.[0]?.url || "/placeholder.svg"}
                alt="Motorcycle mechanic"
                width={600}
                height={500}
                className="h-full w-full object-cover"
                loading="lazy"
                priority={false}
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

