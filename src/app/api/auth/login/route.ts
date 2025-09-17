import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email y contraseña son requeridos." },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return NextResponse.json(
        { message: "Credenciales inválidas." },
        { status: 401 } 
      );
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return NextResponse.json(
        { message: "Credenciales inválidas." },
        { status: 401 } 
      );
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' } 
    );

    const response = NextResponse.json({
      message: "Login exitoso",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 60, 
      path: '/',
    });

    return response;

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Ocurrió un error en el servidor." },
      { status: 500 }
    );
  }
}