import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Article from "@/models/Article";
import Section from "@/models/Section";
import mongoose from "mongoose";

const { isValidObjectId } = mongoose;

function getIdFromRequest(req: NextRequest) {
  const segments = req.nextUrl.pathname.split("/");
  return segments[segments.length - 1];
}

export async function GET(req: NextRequest) {
  const id = getIdFromRequest(req);
  try {
    await dbConnect();

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "ID de artículo no válido." }, { status: 400 });
    }

    const article = await Article.findById(id).populate('section', 'name');

    if (!article) {
      return NextResponse.json({ message: "Artículo no encontrado." }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json(
      { message: "Error al obtener el artículo." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const id = getIdFromRequest(req);
  try {
    await dbConnect();

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "ID de artículo no válido." }, { status: 400 });
    }

    // Recibe todos los campos posibles
    const {
      code,
      name,
      brand,
      units,
      price,
      reference,
      description,
      section,
      unitPrice,
      totalValue,
      detal,
      mayor,
    } = await req.json();

    if (name === undefined || units === undefined) {
      return NextResponse.json(
        { message: "Nombre y unidades son requeridos." },
        { status: 400 }
      );
    }

    if (!isValidObjectId(section)) {
      return NextResponse.json(
        { message: "El ID de la sección no es válido." },
        { status: 400 }
      );
    }

    const sectionExists = await Section.findById(section);
    if (!sectionExists) {
      return NextResponse.json(
        { message: "La sección asignada no existe." },
        { status: 404 }
      );
    }

    // Actualiza todos los campos recibidos
    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      {
        code,
        name,
        brand,
        units,
        price,
        reference,
        description,
        section,
        unitPrice,
        totalValue,
        detal,
        mayor,
      },
      { new: true, runValidators: true }
    );

    if (!updatedArticle) {
      return NextResponse.json({ message: "Artículo no encontrado." }, { status: 404 });
    }

    return NextResponse.json(updatedArticle);
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      return NextResponse.json({ message: messages.join(', ') }, { status: 400 });
    }
    return NextResponse.json(
      { message: error.message || "Error al actualizar el artículo." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const id = getIdFromRequest(req);
  try {
    await dbConnect();

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "ID de artículo no válido." }, { status: 400 });
    }

    const deletedArticle = await Article.findByIdAndDelete(id);

    if (!deletedArticle) {
      return NextResponse.json({ message: "Artículo no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ message: "Artículo eliminado exitosamente." });
  } catch (error) {
    return NextResponse.json(
      { message: "Error al eliminar el artículo." },
      { status: 500 }
    );
  }
}