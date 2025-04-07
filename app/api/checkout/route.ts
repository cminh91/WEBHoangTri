import { NextResponse } from 'next/server'
import prisma from '@/lib/prismadb'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, address, city, district, ward, items, total } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Giỏ hàng trống' }, { status: 400 })
    }

    // Tạo địa chỉ giao hàng
    const createdAddress = await prisma.address.create({
      data: {
        name,
        phone,
        address,
        city,
        district,
        ward,
        userId: '', // Nếu có user đăng nhập thì truyền userId, tạm để rỗng
      },
    })

    // Tạo đơn hàng (Cart)
    const cart = await prisma.cart.create({
      data: {
        addressId: createdAddress.id,
        status: 'CHECKOUT',
        total,
        customerName: name,
        customerPhone: phone,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
        address: true,
      },
    })

    return NextResponse.json({ success: true, cart })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Lỗi khi tạo đơn hàng' }, { status: 500 })
  }
}