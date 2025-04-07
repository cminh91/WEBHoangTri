import { NextResponse } from 'next/server'
import prisma from '@/lib/prismadb'

export async function GET() {
  try {
    const orders = await prisma.cart.findMany({
      where: {
        status: { in: ['CHECKOUT', 'COMPLETED'] }
      },
      include: {
        address: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'Lỗi khi lấy danh sách khách hàng' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Thiếu id đơn hàng' }, { status: 400 })
    }

    // Xóa đơn hàng và các item liên quan
    await prisma.cartItem.deleteMany({
      where: { cartId: id }
    })
    await prisma.cart.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json({ error: 'Lỗi khi xóa đơn hàng' }, { status: 500 })
  }
}