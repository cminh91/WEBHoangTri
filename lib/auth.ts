import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import { compare } from "bcryptjs"

// Mở rộng kiểu User để thêm role
declare module "next-auth" {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  }
  
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    }
  }
}

// Mở rộng kiểu JWT để thêm role
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        name: { label: "Tên đăng nhập", type: "text" },
        password: { label: "Mật khẩu", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        console.log("Attempting login with name:", credentials.name);
        
        const users = await prisma.user.findMany({
          where: {
            name: credentials.name,
            role: "ADMIN"
          }
        });

        if (users.length === 0) {
          console.log("User not found");
          return null;
        }

        const user = users[0];

        if (!user) {
          return null
        }

        try {
          console.log("Comparing passwords...");
          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );

          console.log("Password valid:", isPasswordValid);

          if (!isPasswordValid) {
            console.log("Invalid password");
            return null;
          }
        } catch (error) {
          console.error("Error comparing passwords:", error);
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Đơn giản hóa thông tin trong token
        return {
          ...token,
          id: user.id,
          role: user.role
        }
      }
      return token
    },
    async session({ session, token }) {
      // Đơn giản hóa thông tin trong session
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role
        }
      }
    }
  },
  pages: {
    signIn: "/admin/login",
    signOut: "/admin/login",
    error: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // Giảm xuống 1 ngày
  },
  // Đảm bảo có secret
  secret: process.env.NEXTAUTH_SECRET || "your-fallback-secret-key",
}

// Function to check if user is authenticated and is an admin
export const isAdmin = async (userId?: string) => {
  if (!userId) return false
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  
  return user?.role === "ADMIN"
}

