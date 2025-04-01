import { getContactInfo, getAllCategories, getStoreInfo, getPolicies } from "@/lib/queries"
import ClientMainLayout from "./client-main-layout"

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const [contactInfo, categories, storeInfo, policies] = await Promise.all([
    getContactInfo(),
    getAllCategories(),
    getStoreInfo(),
    getPolicies()
  ])

  return (
    <ClientMainLayout 
      contactInfo={contactInfo}
      categories={categories}
      storeInfo={storeInfo}
      policies={policies}
    >
      {children}
    </ClientMainLayout>
  )
}