import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";

// Schema for policy validation
const policySchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  isPublished: z.boolean().default(true), // Mặc định true trong schema
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isPublishedParam = searchParams.get("isPublished");

  try {
    // Mặc định chỉ lấy chính sách đã publish, trừ khi frontend gửi isPublished=false
    const isPublished = isPublishedParam !== "false"; // true nếu không có param hoặc param là "true"

    const where: any = {
      isPublished, // Lọc mặc định theo isPublished
    };

    const policies = await prisma.policy.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Log để debug
    console.log("GET /api/policies - Query:", { isPublished });
    console.log("GET /api/policies - Fetched policies:", policies);

    return NextResponse.json(policies);
  } catch (error) {
    console.error("GET /api/policies - Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch policies",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // Kiểm tra quyền admin
  if (!session || session.user.role !== "ADMIN") {
    console.log("POST /api/policies - Unauthorized access attempt:", { user: session?.user });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();
    console.log("POST /api/policies - Received data:", json); // Log dữ liệu nhận được từ frontend

    // Parse dữ liệu với schema, đảm bảo isPublished có giá trị mặc định
    const data = policySchema.parse(json);

    // Kiểm tra slug trùng lặp
    const existingPolicy = await prisma.policy.findUnique({
      where: { slug: data.slug },
    });

    if (existingPolicy) {
      console.log("POST /api/policies - Slug conflict:", { slug: data.slug });
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    // Tạo chính sách mới
    const policy = await prisma.policy.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        isPublished: data.isPublished ?? true, // Đảm bảo true nếu không có giá trị
      },
    });

    console.log("POST /api/policies - Created policy:", policy); // Log chính sách vừa tạo

    return NextResponse.json(policy, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log("POST /api/policies - Validation error:", error.errors);
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }

    console.error("POST /api/policies - Error:", error);
    return NextResponse.json(
      {
        error: "Failed to create policy",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}