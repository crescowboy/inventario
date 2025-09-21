import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
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
      return NextResponse.json({ message: "ID de empleado no válido." }, { status: 400 });
    }

    const employee = await Employee.findById(id).populate('section', 'name');

    if (!employee) {
      return NextResponse.json({ message: "Empleado no encontrado." }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch {
    return NextResponse.json(
      { message: "Error al obtener el empleado." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "ID de empleado no válido." }, { status: 400 });
    }

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

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { name, position, section },
      { new: true, runValidators: true }
    );

    if (!updatedEmployee) {
      return NextResponse.json({ message: "Empleado no encontrado." }, { status: 404 });
    }

    return NextResponse.json(updatedEmployee);
  } catch {
    return NextResponse.json(
      { message: "Error al actualizar el empleado." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "ID de empleado no válido." }, { status: 400 });
    }

    const deletedEmployee = await Employee.findByIdAndDelete(id);

    if (!deletedEmployee) {
      return NextResponse.json({ message: "Empleado no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ message: "Empleado eliminado exitosamente." });
  } catch {
    return NextResponse.json(
      { message: "Error al eliminar el empleado." },
      { status: 500 }
    );
  }
}