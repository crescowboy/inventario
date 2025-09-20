import mongoose, { Schema, Document, models } from 'mongoose';

export interface IArticle extends Document {
  code: string;
  name: string;
  brand?: string;
  units: number;
  unitPrice: number;
  totalValue: number;
  detal: number;
  mayor: number;
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
    unitPrice: {
      type: mongoose.Schema.Types.Decimal128,
      required: [true, 'El precio por unidad es requerido'],
      default: 0,
      min: 0,
    },
    totalValue: {
      type: mongoose.Schema.Types.Decimal128,
      required: [true, 'El valor total es requerido'],
      default: 0,
      min: 0,
    },
    detal: {
      type: mongoose.Schema.Types.Decimal128,
      required: [true, 'El campo detal es requerido'],
      default: 0,
      min: 0,
    },
    mayor: {
      type: mongoose.Schema.Types.Decimal128,
      required: [true, 'El campo mayor es requerido'],
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

if (mongoose.models.Article) {
  delete mongoose.models.Article;
}
const Article = mongoose.model<IArticle>('Article', ArticleSchema);

export default Article;