import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { v4 as uuidv4 } from 'uuid'
import { 
  getCartBySessionId, 
  createOrUpdateCartItem, 
  removeCartItem, 
  clearCart, 
  updateCartTotal 
} from "@/lib/cart"
// Define the Image type manually if it is not exported by @prisma/client
interface Image {
  id: string;
  url: string;
  productId: string;
}

// Define the Product type manually if it is not exported by @prisma/client
interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  inStock: boolean;
}

// Define the CartItem type manually if it is not exported by @prisma/client
interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

// Define the types for better type checking
interface CartItemWithProduct extends CartItem {
  product: Product & {
    images: Image[];
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }
}

// GET - Lấy thông tin giỏ hàng
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.cookies.get("cart_session_id")?.value
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    // Nếu không có sessionId hoặc userId, tạo một giỏ hàng rỗng
    if (!sessionId && !userId) {
      return NextResponse.json({ items: [], total: 0 })
    }

    // Lấy giỏ hàng
    const cart = await getCartBySessionId(sessionId, userId)
    
    if (!cart) {
      return NextResponse.json({ items: [], total: 0 })
    }

    // Lấy các items trong giỏ hàng
    const cartItems = await prisma.cartItem.findMany({
      where: {
        cartId: cart.id
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            salePrice: true,
            inStock: true,
            images: {
              select: {
                url: true,
              },
              take: 1,
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    })

    // Tính toán tổng tiền
    let total = 0
    const items = cartItems.map((item: any) => {
      const price = item.product.salePrice || item.product.price
      const itemTotal = Number(price) * item.quantity

      total += itemTotal

      return {
        id: item.id,
        quantity: item.quantity,
        price: Number(item.price),
        productId: item.productId,
        product: {
          ...item.product,
          price: Number(item.product.price),
          salePrice: item.product.salePrice ? Number(item.product.salePrice) : null,
          imageUrl: item.product.images[0]?.url || null,
        },
        total: itemTotal,
      }
    })

    return NextResponse.json({
      id: cart.id,
      items,
      total,
      itemCount: items.length,
    })
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json(
      { error: "Không thể tải giỏ hàng" },
      { status: 500 }
    )
  }
}

// POST - Thêm sản phẩm vào giỏ hàng
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, quantity = 1, options } = body
    
    if (!productId) {
      return NextResponse.json(
        { error: "Thiếu ID sản phẩm" },
        { status: 400 }
      )
    }

    // Kiểm tra sản phẩm tồn tại
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Sản phẩm không tồn tại" },
        { status: 404 }
      )
    }

    if (!product.inStock) {
      return NextResponse.json(
        { error: "Sản phẩm đã hết hàng" },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    const sessionId = req.cookies.get("cart_session_id")?.value

    // Thêm sản phẩm vào giỏ hàng
    const result = await createOrUpdateCartItem({
      productId,
      quantity,
      options,
      sessionId,
      userId
    })

    const response = NextResponse.json({
      message: "Đã thêm sản phẩm vào giỏ hàng",
      cartItem: result.cartItem,
    })

    // Set cookie nếu cần thiết
    if (result.newSessionId) {
      response.cookies.set({
        name: "cart_session_id",
        value: result.newSessionId,
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 ngày
        path: "/",
      })
    }

    return response
  } catch (error) {
    console.error("Error adding item to cart:", error)
    return NextResponse.json(
      { error: "Không thể thêm sản phẩm vào giỏ hàng" },
      { status: 500 }
    )
  }
}

// PUT - Cập nhật số lượng sản phẩm trong giỏ hàng
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, quantity } = body
    
    if (!productId) {
      return NextResponse.json(
        { error: "Thiếu ID sản phẩm" },
        { status: 400 }
      )
    }

    if (quantity < 1) {
      return NextResponse.json(
        { error: "Số lượng phải lớn hơn 0" },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    const sessionId = req.cookies.get("cart_session_id")?.value

    // Cập nhật sản phẩm với force update
    const result = await createOrUpdateCartItem({
      productId,
      quantity,
      sessionId,
      userId,
      forceUpdate: true
    })

    return NextResponse.json({
      message: "Đã cập nhật giỏ hàng",
      cartItem: result.cartItem,
    })
  } catch (error) {
    console.error("Error updating cart:", error)
    return NextResponse.json(
      { error: "Không thể cập nhật giỏ hàng" },
      { status: 500 }
    )
  }
}

// DELETE - Xóa sản phẩm khỏi giỏ hàng
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const productId = url.searchParams.get("productId")
    const clearAll = url.searchParams.get("clear") === "true"
    
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    const sessionId = req.cookies.get("cart_session_id")?.value

    if (clearAll) {
      // Xóa toàn bộ giỏ hàng
      await clearCart(sessionId, userId)
      
      return NextResponse.json({
        message: "Đã xóa toàn bộ giỏ hàng",
      })
    }
    
    if (!productId) {
      return NextResponse.json(
        { error: "Thiếu ID sản phẩm" },
        { status: 400 }
      )
    }

    // Xóa một sản phẩm khỏi giỏ hàng
    await removeCartItem({
      productId,
      sessionId,
      userId
    })

    return NextResponse.json({
      message: "Đã xóa sản phẩm khỏi giỏ hàng",
    })
  } catch (error) {
    console.error("Error removing item from cart:", error)
    return NextResponse.json(
      { error: "Không thể xóa sản phẩm khỏi giỏ hàng" },
      { status: 500 }
    )
  }
} 