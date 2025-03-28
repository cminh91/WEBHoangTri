import { Gauge, Settings, Wrench } from "lucide-react"

export default function ServiceCards() {
  const services = [
    {
      id: 1,
      icon: <Gauge className="h-12 w-12 text-white" />,
      title: "KIỂM TRA HIỆU SUẤT",
      description:
        "Lorem ipsum chỉ đơn giản là văn bản giả của ngành in ấn và sắp chữ. Lorem ipsum đã trở thành chuẩn mực của ngành.",
    },
    {
      id: 2,
      icon: <Wrench className="h-12 w-12 text-white" />,
      title: "SỬA CHỮA MÔ TÔ",
      description:
        "Lorem ipsum chỉ đơn giản là văn bản giả của ngành in ấn và sắp chữ. Lorem ipsum đã trở thành chuẩn mực của ngành.",
    },
    {
      id: 3,
      icon: <Settings className="h-12 w-12 text-white" />,
      title: "DỊCH VỤ ĐỘ XE",
      description:
        "Lorem ipsum chỉ đơn giản là văn bản giả của ngành in ấn và sắp chữ. Lorem ipsum đã trở thành chuẩn mực của ngành.",
    },
  ]

  return (
    <section className="bg-black py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {services.map((service) => (
            <div key={service.id} className="flex flex-col">
              <div className="mb-4 flex items-center">
                <div className="mr-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-600">
                  {service.icon}
                </div>
                <div className="text-lg font-bold">{service.id}</div>
              </div>
              <h3 className="mb-2 text-xl font-bold">{service.title}</h3>
              <p className="text-gray-400">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

