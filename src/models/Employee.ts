import mongoose, { Schema, Document, models } from 'mongoose';

export interface IEmployee extends Document {
  name: string;
  email: string;
  role: 'admin' | 'jefe' | 'empleado';
  hireDate?: Date;
}

const EmployeeSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio.'],
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio.'],
      unique: true,
      match: [/.+\@.+\..+/, 'Por favor, introduce un email válido.'],
    },
    role: {
      type: String,
      required: true,
      enum: ['admin', 'jefe', 'empleado'],
      default: 'empleado',
    },
    hireDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Employee = models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);

export default Employee;
