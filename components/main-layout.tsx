import { getContactInfo, getAllCategories, getStoreInfo } from "@/lib/queries"
import ClientMainLayout from "./client-main-layout"

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const [contactInfo, categories, storeInfo] = await Promise.all([
    getContactInfo(),
    getAllCategories(),
    getStoreInfo()
  ])

  console.log('Contact Info:', contactInfo)
  console.log('Categories:', categories)
  console.log('Store Info:', storeInfo)

  return (
    <ClientMainLayout 
      contactInfo={contactInfo}
      categories={categories}
      storeInfo={storeInfo}
    >
      {children}
    </ClientMainLayout>
  )
}