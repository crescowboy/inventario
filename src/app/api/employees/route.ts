import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
import Section from "@/models/Section";
import { isValidObjectId } from "mongoose";

export async function GET() {
  try {
    await dbConnect();
    const employees = await Employee.find({}).populate('section', 'name').sort({ name: 1 });
    return NextResponse.json(employees);
  } catch {
    return NextResponse.json(
      { message: "Error al obtener los empleados." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { name, position, section } = await req.json();

    if (!name || !position || !section) {
      return NextResponse.json(
        { message: "Nombre, cargo y sección son requeridos." },
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

    const newEmployee = new Employee({
      name,
      position,
      section,
    });

    const savedEmployee = await newEmployee.save();

    return NextResponse.json(savedEmployee, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Error al crear el empleado." },
      { status: 500 }
    );
  }
}
