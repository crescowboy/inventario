import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Section from "@/models/Section";

export async function GET() {
  try {
    await dbConnect();
    const sections = await Section.find({}).sort({ name: 1 });
    return NextResponse.json(sections);
  } catch (error) {
    return NextResponse.json(
      { message: "Error al obtener las secciones." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json(
        { message: "El nombre de la sección es requerido." },
        { status: 400 }
      );
    }

    const newSection = new Section({
      name,
      description,
    });

    const savedSection = await newSection.save();

    return NextResponse.json(savedSection, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
        return NextResponse.json(
            { message: `Ya existe una sección con el nombre \"${error.keyValue.name}\".` },
            { status: 409 } // Conflict
        );
    }
    return NextResponse.json(
      { message: "Error al crear la sección." },
      { status: 500 }
    );
  }
}
