import { v4 as uuidv4 } from "uuid"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"

// Interface cho cart item
interface CartItemParams {
  productId: string
  quantity: number
  options?: any
  sessionId?: string | null
  userId?: string | null
  forceUpdate?: boolean
}

interface CartItemWithProduct {
  id: string
  cartId: string
  productId: string
  quantity: number
  price: Prisma.Decimal | number
  product: {
    name: string
    slug: string
    price: Prisma.Decimal | number
    salePrice: Prisma.Decimal | number | null
  }
}

// Lấy giỏ hàng theo sessionId hoặc userId
export async function getCartBySessionId(sessionId?: string | null, userId?: string | null) {
  if (!sessionId && !userId) return null

  try {
    return await prisma.cart.findFirst({
      where: {
        OR: [
          sessionId ? { sessionId } : {},
          userId ? { userId } : {},
        ],
        status: "ACTIVE",
      },
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return null;
  }
}

// Tạo hoặc cập nhật một mục trong giỏ hàng
export async function createOrUpdateCartItem({
  productId,
  quantity,
  options,
  sessionId,
  userId,
  forceUpdate = false,
}: CartItemParams) {
  // Lấy thông tin sản phẩm
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { price: true, salePrice: true },
  })

  if (!product) {
    throw new Error("Product not found")
  }

  // Giá sẽ được sử dụng (giá khuyến mãi nếu có, không thì giá gốc)
  const price = product.salePrice || product.price

  // Tìm giỏ hàng hiện tại hoặc tạo mới
  let cart = await getCartBySessionId(sessionId, userId)

  if (!cart) {
    // Tạo giỏ hàng mới
    const newSessionId = !userId ? uuidv4() : null;
    cart = await prisma.cart.create({
      data: {
        sessionId: newSessionId,
        userId,
        status: "ACTIVE",
      },
    });
    
    return { cart, newSessionId };
  } else if (userId && cart.userId !== userId) {
    // Nếu user đã đăng nhập nhưng giỏ hàng thuộc về session, cập nhật userId
    cart = await prisma.cart.update({
      where: { id: cart.id },
      data: { userId },
    });
  }

  // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
    },
  });

  let cartItem;

  if (existingItem) {
    // Nếu force update thì cập nhật số lượng mới, nếu không thì cộng thêm
    const newQuantity = forceUpdate ? quantity : existingItem.quantity + quantity

    // Cập nhật số lượng
    cartItem = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: newQuantity,
        price,
        options: options ? JSON.stringify(options) : null,
      },
      include: {
        product: {
          select: {
            name: true,
            slug: true,
            price: true,
            salePrice: true,
          },
        },
      },
    });
  } else {
    // Thêm sản phẩm mới vào giỏ hàng
    cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        price,
        options: options ? JSON.stringify(options) : null,
      },
      include: {
        product: {
          select: {
            name: true,
            slug: true,
            price: true,
            salePrice: true,
          },
        },
      },
    });
  }

  // Cập nhật tổng giỏ hàng
  await updateCartTotal(cart.id);
  
  return { cartItem, newSessionId: null };
}

// Xóa một mục khỏi giỏ hàng
export async function removeCartItem({
  productId,
  sessionId,
  userId,
}: {
  productId: string
  sessionId?: string | null
  userId?: string | null
}) {
  const cart = await getCartBySessionId(sessionId, userId)

  if (!cart) {
    throw new Error("Cart not found")
  }

  // Xóa mục khỏi giỏ hàng
  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
      productId,
    },
  });

  // Cập nhật tổng giỏ hàng
  await updateCartTotal(cart.id);

  return true;
}

// Xóa toàn bộ giỏ hàng
export async function clearCart(sessionId?: string | null, userId?: string | null) {
  const cart = await getCartBySessionId(sessionId, userId)

  if (!cart) {
    throw new Error("Cart not found")
  }

  // Xóa tất cả các mục trong giỏ hàng
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  // Cập nhật tổng giỏ hàng (là 0)
  await prisma.cart.update({
    where: { id: cart.id },
    data: { total: 0 },
  });

  return true;
}

// Cập nhật tổng tiền giỏ hàng
export async function updateCartTotal(cartId: string) {
  // Lấy thông tin các sản phẩm trong giỏ hàng
  const cartItems = await prisma.cartItem.findMany({
    where: { cartId },
    include: {
      product: {
        select: {
          price: true,
          salePrice: true,
        },
      },
    },
  });

  let total = 0;
  cartItems.forEach((item) => {
    const price = item.product.salePrice || item.product.price;
    total += Number(price) * item.quantity;
  });

  // Cập nhật tổng tiền
  await prisma.cart.update({
    where: { id: cartId },
    data: { total },
  });

  return total;
} 