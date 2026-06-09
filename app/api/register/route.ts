import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export async function POST(request: NextRequest) {
    try {
        const { email, password, username, name } = await request.json();

        if (!email || !password || !username) {
            return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
        }

        if (password.length < 8 || !PASSWORD_REGEX.test(password)) {
            return NextResponse.json({
                error: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
            }, {status: 400});
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