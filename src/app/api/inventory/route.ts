
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Article from "@/models/Article";
import Section from "@/models/Section";
import { isValidObjectId } from "mongoose";

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

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  // Manejo de carga masiva
  if (Array.isArray(body)) {
    try {
      const sections = await Section.find({});
      const sectionMap = new Map(sections.map(s => [s.name.toLowerCase(), s._id]));

      const articlesToCreate = [];
      const errors = [];

      for (const item of body) {
        const { name, code, units, price, section: sectionName, ...rest } = item;

        if (!name || !code || units === undefined || price === undefined || !sectionName) {
          errors.push({ code: code || 'N/A', error: "Campos requeridos faltantes (name, code, units, price, section)." });
          continue;
        }

        const sectionId = sectionMap.get(sectionName.toLowerCase());
        if (!sectionId) {
          errors.push({ code, error: `La sección '${sectionName}' no fue encontrada.` });
          continue;
        }

        articlesToCreate.push({
          name,
          code,
          units,
          price,
          section: sectionId,
          ...rest
        });
      }

      if (articlesToCreate.length > 0) {
        await Article.insertMany(articlesToCreate, { ordered: false });
      }

      let message = `${articlesToCreate.length} artículos han sido creados.`;
      if (errors.length > 0) {
        message += ` ${errors.length} artículos no se pudieron crear.`;
      }

      return NextResponse.json({ message, errors }, { status: errors.length > 0 ? 207 : 201 });

    } catch (error: any) {
        if (error.name === 'MongoBulkWriteError' && error.code === 11000) {
            // Extraer los códigos duplicados del mensaje de error
            const duplicates = error.writeErrors.map((e: any) => e.err.op.code);
            return NextResponse.json(
                { 
                    message: "Error durante la carga masiva. Se encontraron códigos de artículo duplicados.",
                    errors: duplicates.map((code: string) => ({ code, error: "El código de artículo ya existe." }))
                },
                { status: 409 }
            );
        }
        return NextResponse.json({ message: "Error en el servidor durante la carga masiva.", error: error.message }, { status: 500 });
    }
  }

  // Manejo de creación de un solo artículo
  try {
    const { name, code, brand, units, price, reference, description, section } = body;

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
    
    const codeExists = await Article.findOne({ code });
    if (codeExists) {
        return NextResponse.json(
            { message: "El código de artículo ya existe." },
            { status: 409 }
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
  } catch (error: any) {
     if (error.code === 11000) {
        return NextResponse.json(
            { message: "Error de duplicado: El código de artículo ya existe." },
            { status: 409 }
        );
    }
    return NextResponse.json(
      { message: "Error al crear el artículo.", error: error.message },
      { status: 500 }
    );
  }
}
