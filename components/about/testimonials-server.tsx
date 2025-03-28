import Image from "next/image"
import prisma from "@/lib/db"

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio: string;
  image: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

async function getTeamMembers() {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      orderBy: {
        order: 'asc',
      },
    });
    return teamMembers;
  } catch (error) {
    console.error("Error fetching team members:", error);
    return [];
  }
}

export default async function TeamMembers() {
  // Lấy dữ liệu từ database
  const teamMembers = await getTeamMembers();
  
  // Dữ liệu fallback nếu không có dữ liệu từ database
  const fallbackTeam = [
    {
      id: "1",
      name: "Nguyễn Phúc Trí",
      position: "Chủ Tiệm",
      image: "/placeholder.svg?height=400&width=300",
      bio: "Với hơn 15 năm kinh nghiệm trong ngành sửa chữa và độ xe mô tô",
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      name: "Đặng Thanh Hải",
      position: "Kỹ Thuật Viên Trưởng",
      image: "/placeholder.svg?height=400&width=300",
      bio: "Chuyên gia về động cơ và hệ thống điện xe máy phân khối lớn",
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "3",
      name: "Trần Văn Đức",
      position: "Chuyên Gia Độ Xe",
      image: "/placeholder.svg?height=400&width=300",
      bio: "Đam mê và sáng tạo trong việc độ xe theo phong cách cá nhân",
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "4",
      name: "Lê Thị Hương",
      position: "Quản Lý Cửa Hàng",
      image: "/placeholder.svg?height=400&width=300",
      bio: "Tận tâm chăm sóc khách hàng và quản lý hoạt động cửa hàng",
      order: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // Sử dụng dữ liệu từ database hoặc fallback
  const team = teamMembers.length > 0 ? teamMembers : fallbackTeam;

  return (
    <div className="mb-16">
      <h2 className="mb-2 text-center text-3xl font-bold uppercase">Đội Ngũ Của Chúng Tôi</h2>
      <p className="mb-12 text-center text-gray-400">
        Gặp gỡ những chuyên gia đứng sau thành công của Hoàng Trí Moto
      </p>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {team.map((member) => (
          <div key={member.id} className="group overflow-hidden rounded-lg bg-zinc-900">
            <div className="relative h-80 w-full overflow-hidden">
              <Image
                src={member.image || "/placeholder.svg"}
                alt={member.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full p-4">
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-red-600">{member.position}</p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-gray-400">{member.bio}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 