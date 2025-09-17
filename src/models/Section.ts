import mongoose, { Schema, Document, models } from 'mongoose';

export interface ISection extends Document {
  name: string;
  description?: string;
}

const SectionSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre de la sección es obligatorio.'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Section = models.Section || mongoose.model<ISection>('Section', SectionSchema);

export default Section;
