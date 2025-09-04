import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const runtime = "nodejs";

const RegisterSchema = z.object({
  nama: z.string().min(1, "Nama tidak boleh kosong"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parse = RegisterSchema.safeParse(body);

    if (!parse.success) {
      const flat = parse.error.flatten();
      const msg =
        flat.formErrors[0] ||
        Object.values(flat.fieldErrors).flat()[0] ||
        "Data tidak valid";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { nama, email, password } = parse.data;

    const exist = await prisma.user.findUnique({ where: { email } });
    if (exist) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 409 }
      );
    }

    const hash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { name: nama, email, password: hash, role: "ADMIN" },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Admin register error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat registrasi admin" },
      { status: 500 }
    );
  }
}
