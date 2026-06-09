import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { email, password, username, name } = await request.json();

        if (!email || !password || !username) {
            return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });

        if (existingUser) {
            return NextResponse.json({ error: "Email hoặc username đã tồn tại" }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                username,
                name: name || username,
                password: hashedPassword,
            },
        });

        return NextResponse.json({
            message: "Đăng ký thành công",
            userId: user.id
        }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
    }
}