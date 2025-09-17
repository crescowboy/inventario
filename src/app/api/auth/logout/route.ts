import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ message: "Logout exitoso." });

    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      expires: new Date(0),
      path: '/',
    });

    return response;
    
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Ocurrió un error durante el logout." },
      { status: 500 }
    );
  }
}
