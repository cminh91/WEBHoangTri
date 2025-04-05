import { prisma } from '@/lib/db'
import Link from 'next/link'

async function getAllPolicies() {
  try {
    const policies = await prisma.policy.findMany({
      where: {
        isPublished: true
      },
      orderBy: [
        { order: 'asc' },
        { title: 'asc' } // Sắp xếp phụ theo tên nếu order giống nhau
      ],
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true
      }
    })
    
    return policies
  } catch (error) {
    console.error('Lỗi khi lấy danh sách chính sách:', error)
    return []
  }
}

export default async function PoliciesPage() {
  const policies = await getAllPolicies()
  
  return (
    <div className="prose prose-invert max-w-none prose-headings:text-red-600">
      <h1>Chính Sách</h1>
      
      <p className="text-lg">
        Tại Moto Edit, chúng tôi cam kết mang đến cho khách hàng trải nghiệm mua sắm và dịch vụ tốt nhất. 
        Vui lòng tham khảo các chính sách của chúng tôi dưới đây.
      </p>
      
      <div className="mt-8 grid gap-6">
        {policies.length > 0 ? (
          policies.map((policy: { id: string; title: string; slug: string; excerpt: string | null }) => (
            <div key={policy.id} className="border border-zinc-800 rounded-lg p-6 hover:border-red-600 transition-colors">
              <h2 className="text-xl font-bold mb-2">
                <Link href={`/chinh-sach/${policy.slug}`} className="text-red-500 hover:text-red-400 no-underline">
                  {policy.title}
                </Link>
              </h2>
              {policy.excerpt && <p className="text-gray-400">{policy.excerpt}</p>}
              <Link href={`/chinh-sach/${policy.slug}`} className="text-red-500 hover:text-red-400 inline-block mt-2">
                Xem chi tiết →
              </Link>
            </div>
          ))
        ) : (
          <div className="text-gray-400">Không có chính sách nào được tìm thấy.</div>
        )}
      </div>
    </div>
  )
}