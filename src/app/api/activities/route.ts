import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Activity from '@/models/Activity';

export async function GET() {
  await dbConnect();

  try {
    const activities = await Activity.find({}).sort({ timestamp: -1 }).limit(50);
    return NextResponse.json(activities);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener las actividades', error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    const newActivity = new Activity(body);
    await newActivity.save();
    return NextResponse.json(newActivity, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error al crear la actividad', error }, { status: 500 });
  }
}
