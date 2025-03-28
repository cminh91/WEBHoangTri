export default function StatsCounter() {
  const stats = [
    { number: "2+", label: "NĂM PHỤC VỤ" },
    { number: "12+", label: "KHÁCH HÀNG HÀI LÒNG" },
    { number: "6+", label: "SỰ HÀI LÒNG CỦA KHÁCH HÀNG" },
  ]

  return (
    <section className="bg-black py-16 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mb-2 text-3xl font-bold text-red-600">{stat.number}</div>
              <div className="text-xl font-bold">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

