import mongoose, { Schema, Document, models } from 'mongoose';

export interface IArticle extends Document {
  code: string;
  name: string;
  brand?: string;
  units: number;
  price: number;
  reference?: string;
  description?: string;
  section: mongoose.Schema.Types.ObjectId;
}

const ArticleSchema: Schema = new Schema(
  {
    code: {
      type: String,
      required: [true, 'El código es requerido'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    units: {
      type: Number,
      required: [true, 'Las unidades son requeridas'],
      default: 0,
      min: 0,
    },
    price: {
      type: Number,
      required: [true, 'El precio es requerido'],
      default: 0,
      min: 0,
    },
    reference: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    section: {
      type: Schema.Types.ObjectId,
      ref: 'Section',
      required: [true, 'La sección es requerida'],
    },
  },
  {
    timestamps: true,
  }
);

const Article = models.Article || mongoose.model<IArticle>('Article', ArticleSchema);

export default Article;