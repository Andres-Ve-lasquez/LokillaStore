import { Schema, model, models } from "mongoose";

const VariantSchema = new Schema(
  {
    talla: { type: String, trim: true, default: "" },
    color: { type: String, trim: true, default: "" },
    name: { type: String, trim: true },   // ej: "Talla" o "Color"
    value: { type: String, trim: true },  // ej: "M" o "Rojo"
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, trim: true },
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, required: true, trim: true },
    precio: { type: Number, required: true, min: 0 },
    imagenUrl: { type: String, default: "" },
    stock: { type: Number, required: true, min: 0 },
    minStock: { type: Number, default: 5, min: 0 }, // umbral para alerta
    coleccion: { type: String, index: true },
    sku: { type: String, trim: true, unique: true, sparse: true },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String, trim: true }],
    variants: [VariantSchema],
  },
  { timestamps: true }
);

export default models.Product || model("Product", ProductSchema);
