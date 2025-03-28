"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Star } from "lucide-react"

interface Testimonial {
  id: string
  name: string
  position: string | null
  company: string | null
  content: string
  rating: number
  image: string | null
  isActive?: boolean
  order: number
  active?: boolean // Để tương thích với interface ban đầu
}

interface TestimonialsSectionProps {
  initialTestimonials?: Testimonial[]
}

export default function TestimonialsSection({ initialTestimonials }: TestimonialsSectionProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(!initialTestimonials)

  useEffect(() => {
    if (initialTestimonials && initialTestimonials.length > 0) {
      // Thêm thuộc tính active nếu cần
      const processedTestimonials = initialTestimonials.map(item => ({
        ...item,
        active: item.isActive
      }))
      setTestimonials(processedTestimonials)
      setLoading(false)
      return
    }

    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials/public', {
          next: { revalidate: 3600 }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch testimonials')
        }
        
        const data = await response.json()
        // Thêm thuộc tính active nếu cần
        const processedTestimonials = data.map((item: any) => ({
          ...item,
          active: item.isActive
        }))
        setTestimonials(processedTestimonials)
      } catch (error) {
        console.error('Error fetching testimonials:', error)
        setTestimonials(fallbackTestimonials)
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [initialTestimonials])

  // Fallback data if API fails
  const fallbackTestimonials: Testimonial[] = [
    {
      id: "1",
      name: "Nguyễn Văn A",
      position: "Kỹ sư",
      company: "Công ty XYZ",
      content: "Tôi rất hài lòng với dịch vụ tại Hoàng Trí Moto. Nhân viên nhiệt tình, kỹ thuật viên chuyên nghiệp.",
      rating: 5,
      image: null,
      isActive: true,
      order: 1,
      active: true
    },
    {
      id: "2",
      name: "Trần Thị B",
      position: "Giám đốc",
      company: "Công ty ABC",
      content: "Đã sửa chữa xe tại đây nhiều lần và luôn hài lòng với chất lượng dịch vụ. Giá cả phải chăng, chất lượng tốt.",
      rating: 5,
      image: null,
      isActive: true,
      order: 2,
      active: true
    },
    {
      id: "3",
      name: "Lê Văn C",
      position: "Nhân viên văn phòng",
      company: "Công ty DEF",
      content: "Dịch vụ chăm sóc khách hàng tuyệt vời. Sẽ tiếp tục quay lại trong tương lai.",
      rating: 4,
      image: null,
      isActive: true,
      order: 3,
      active: true
    }
  ]

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-5 w-5 ${
            i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      )
    }
    return stars
  }

  if (loading) {
    return (
      <section className="bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Đánh Giá Của Khách Hàng</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-800 animate-pulse h-64 rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-gray-900 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Đánh Giá Của Khách Hàng</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(testimonials.length > 0 ? testimonials : fallbackTestimonials).slice(0, 3).map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-gray-800 p-6 rounded-lg text-center flex flex-col h-full"
            >
              <div className="flex justify-center mb-4">
                {testimonial.image ? (
                  <div className="relative w-20 h-20 rounded-full overflow-hidden">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
                    <span className="text-2xl font-bold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex justify-center mb-4">
                {renderStars(testimonial.rating)}
              </div>
              <p className="text-gray-300 mb-4 flex-grow">"{testimonial.content}"</p>
              <div>
                <h3 className="font-bold text-lg">{testimonial.name}</h3>
                {(testimonial.position || testimonial.company) && (
                  <p className="text-gray-400">
                    {testimonial.position}
                    {testimonial.position && testimonial.company && " - "}
                    {testimonial.company}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 