import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function TeamShowcase() {
  const teamMembers = [
    {
      image: "/placeholder.svg?height=400&width=300",
      name: "Nguyễn Phúc Trí",
      role: "Chủ Tiệm",
    },
    {
      image: "/placeholder.svg?height=400&width=300",
      name: "Đặng Thanh Hải",
      role: "Kỹ Thuật Viên Trưởng",
    },
    {
      image: "/placeholder.svg?height=400&width=300",
      name: "Trần Văn Đức",
      role: "Chuyên Gia Độ Xe",
    },
  ]

  return (
    <section className="bg-black py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-2 text-center text-3xl font-bold md:text-4xl">XEM NHỮNG GÌ CHÚNG TÔI ĐÃ LÀM</h2>
        <p className="mb-12 text-center text-gray-400">Đội ngũ chuyên nghiệp với nhiều năm kinh nghiệm</p>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {teamMembers.map((member, index) => (
            <div key={index} className="group relative overflow-hidden rounded-lg">
              <div className="relative h-[400px] w-full">
                <Image
                  src={member.image || "/placeholder.svg"}
                  alt={member.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 w-full p-6">
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="mb-4 text-green-500">{member.role}</p>
                <Button className="bg-green-500 hover:bg-green-600">Xem Thêm</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

