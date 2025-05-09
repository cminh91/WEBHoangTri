import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/db"
import { getStoreInfo } from "@/lib/queries";

export default async function WhyChooseUs() {
  // Fetch about data from database
  const aboutData = await prisma.about.findFirst({
    select: {
      title: true,
      content: true,
      images: {
        take: 1
      }
    }
  });

  const storeInfo = await getStoreInfo();
  return (
    <section className="bg-black pt-0 pb-16 md:pt-16 md:pb-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-6 text-4xl text-red-600 font-bold uppercase">
              {aboutData?.title || "Tại sao lại chọn chúng tôi"}
            </h2>
            <div 
              className="mb-8"
              dangerouslySetInnerHTML={{
                __html: aboutData?.content || ""
              }}
            />
            <Link href="/ve-chung-toi">
              <Button className="bg-red-600 px-8 py-6 text-lg font-semibold text-white hover:bg-red-700">
                XEM THÊM
              </Button>
            </Link>
          </div>
          <div className="relative">
            <div className="absolute -right-4 -top-4 h-full w-full border-t-4 border-r-4 border-red-600"></div>
            <div className="relative h-full w-full overflow-hidden">
              <Image
                src={aboutData?.images?.[0]?.url || "/placeholder.svg"}
                alt="Motorcycle mechanic"
                width={600}
                height={500}
                className="h-full w-full object-cover"
                loading="lazy"
                priority={false}
              />
              <div className="absolute bottom-8 right-8 h-20 w-20 rounded-full p-0">
                <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-red-600 bg-black">
                  {storeInfo?.logo ? (
                    <Image
                      src={storeInfo.logo}
                      alt="Logo"
                      fill
                      className="object-contain rounded-full"
                    />
                  ) : (
                    <span className="text-xl font-bold text-red-600">HT</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

