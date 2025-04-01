import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'

interface PolicyPageProps {
  params: {
    slug: string
  }
}

async function getPolicy(slug: string) {
  try {
    const policy = await prisma.policy.findUnique({
      where: {
        slug: slug,
        isPublished: true
      }
    })
    
    return policy
  } catch (error) {
    console.error(`Lỗi khi lấy chính sách với slug ${slug}:`, error)
    return null
  }
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const policy = await getPolicy(params.slug)
  
  if (!policy) {
    notFound()
  }
  
  return (
    <div className="prose prose-invert max-w-none prose-headings:text-red-600">
      <h1>{policy.title}</h1>
      
      {policy.excerpt && (
        <div className="text-lg text-gray-300 mb-6">
          {policy.excerpt}
        </div>
      )}
      
      <div dangerouslySetInnerHTML={{ __html: policy.content }} />
      
      <p className="text-sm italic mt-8">
        Cập nhật lần cuối: {new Date(policy.updatedAt).toLocaleDateString('vi-VN')}
      </p>
    </div>
  )
}