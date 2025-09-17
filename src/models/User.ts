import mongoose, { Schema, Document, models } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // El password no siempre se devuelve en las consultas
  role: 'admin' | 'jefe' | 'empleado';
}

const UserSchema: Schema = new Schema(
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
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria.'],
      select: false, // Por defecto, no incluir el password en las consultas
    },
    role: {
      type: String,
      required: true,
      enum: ['admin', 'jefe', 'empleado'],
      default: 'empleado',
    },
  },
  {
    timestamps: true,
  }
);

// Middleware para hashear la contraseña antes de guardarla
UserSchema.pre<IUser>('save', async function (next) {
  // Si la contraseña no se ha modificado, no hacer nada
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    // Generar el salt
    const salt = await bcrypt.genSalt(10);
    // Hashear la contraseña
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    // Asegurarse de que el error se pase a Mongoose
    if (error instanceof Error) {
      return next(error);
    }
    return next(new Error('Error al hashear la contraseña'));
  }
});

const User = models.User || mongoose.model<IUser>('User', UserSchema);

export default User;