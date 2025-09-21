import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Section from "@/models/Section";
import mongoose from "mongoose";

interface Params {
  params: { id: string };
}

const { isValidObjectId } = mongoose;

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "ID de sección no válido." }, { status: 400 });
    }

    const section = await Section.findById(id);

    if (!section) {
      return NextResponse.json({ message: "Sección no encontrada." }, { status: 404 });
    }

    return NextResponse.json(section);
  } catch {
    return NextResponse.json(
      { message: "Error al obtener la sección." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "ID de sección no válido." }, { status: 400 });
    }

    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json(
        { message: "El nombre de la sección es requerido." },
        { status: 400 }
      );
    }

    const updatedSection = await Section.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!updatedSection) {
      return NextResponse.json({ message: "Sección no encontrada." }, { status: 404 });
    }

    return NextResponse.json(updatedSection);
  } catch (error) {
    if (error.code === 11000) {
        return NextResponse.json(
            { message: `Ya existe una sección con el nombre \"${error.keyValue.name}\".` },
            { status: 409 }
        );
    }
    return NextResponse.json(
      { message: "Error al actualizar la sección." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "ID de sección no válido." }, { status: 400 });
    }

    const deletedSection = await Section.findByIdAndDelete(id);

    if (!deletedSection) {
      return NextResponse.json({ message: "Sección no encontrada." }, { status: 404 });
    }

    return NextResponse.json({ message: "Sección eliminada exitosamente." });
  } catch {
    return NextResponse.json(
      { message: "Error al eliminar la sección." },
      { status: 500 }
    );
  }
}