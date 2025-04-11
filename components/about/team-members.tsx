"use client"

import Image from "next/image"

interface TeamMember {
  id: string
  name: string
  position: string
  image: string
  bio: string
  order: number
}

interface TeamMembersProps {
  teamMembers: TeamMember[]
}

export default function TeamMembers({ teamMembers }: TeamMembersProps) {
  return (
    <div className="container bg-black">
      <h2 className="mb-2 text-center text-3xl font-bold uppercase text-red-600">
        Đội Ngũ Của Chúng Tôi
      </h2>
      <p className="mb-12 text-center text-gray-400">
        Chúng tôi đã hợp nhất đầy đủ các chuyên gia sửa xe ở đây
      </p>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {teamMembers.map((member) => (
          <div 
            key={member.id} 
            className="group overflow-hidden rounded-lg bg-neutral-900 border-2 border-red-900 transition-all duration-300 hover:border-red-600"
          >
            <div className="relative h-80 w-full overflow-hidden">
              <Image
                src={member.image}
                alt={member.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full p-4">
                <h3 className="text-xl font-bold text-white">{member.name}</h3>
                <p className="text-red-500">{member.position}</p>
              </div>
            </div>
            <div className="p-4 bg-neutral-800">
              <p className="text-gray-300">{member.bio}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}