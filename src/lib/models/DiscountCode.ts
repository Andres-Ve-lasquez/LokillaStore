import { Schema, model, models } from "mongoose";

const DiscountCodeSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    value: { type: Number, required: true, min: 0 }, // % o monto
    appliesTo: { type: String, enum: ["product", "coleccion", "order"], required: true },

    productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    colecciones: [{ type: String }],

    minOrderAmount: { type: Number, default: 0 },
    startAt: { type: Date },
    endAt: { type: Date },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.DiscountCode || model("DiscountCode", DiscountCodeSchema);
