import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Article from "@/models/Article";
import Section from "@/models/Section";
import { isValidObjectId } from "mongoose";

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Obtiene todos los artículos del inventario
 *     description: Retorna una lista de todos los artículos disponibles en el inventario.
 *     responses:
 *       200:
 *         description: Lista de artículos del inventario.
 */
export async function GET() {
  try {
    await dbConnect();
    const articles = await Article.find({}).populate('section', 'name').sort({ name: 1 });
    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json(
      { message: "Error al obtener el inventario." },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     summary: Crea un nuevo artículo en el inventario
 *     description: Añade un nuevo artículo a la lista del inventario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               units: { type: number }
 *               description: { type: string }
 *               section: { type: string }
 *               image: { type: string }
 *     responses:
 *       201:
 *         description: Artículo creado exitosamente.
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { name, code, brand, units, price, reference, description, section } = await req.json();

    if (!name || !code || units === undefined || price === undefined || !section) {
      return NextResponse.json(
        { message: "Nombre, código, unidades, precio y sección son requeridos." },
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

    const newArticle = new Article({
      name,
      code,
      brand,
      units,
      price,
      reference,
      description,
      section,
    });

    const savedArticle = await newArticle.save();

    return NextResponse.json(savedArticle, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error al crear el artículo." },
      { status: 500 }
    );
  }
}