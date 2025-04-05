import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Quản lý Danh mục - Hoàng Trí Moto Admin",
  description: "Quản lý danh mục sản phẩm, dịch vụ và tin tức",
}

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
