import { Schema, model, models } from "mongoose";

const ItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    cantidad: { type: Number, required: true, min: 1 },
    imagenUrl: { type: String, default: "" },
    coleccion: { type: String, default: "" },
    talla: { type: String },
    color: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },

    customer: {
      nombre: { type: String, required: true },
      email: { type: String, required: true },
      telefono: { type: String, required: true },
    },

    address: {
      region: { type: String, required: true },
      ciudad: { type: String, required: true },
      comuna: { type: String, required: true },
      calle: { type: String, required: true },
      numero: { type: String, required: true },
      depto: { type: String, default: "" },
    },

    items: [ItemSchema],
    notes: { type: String, default: "" },

    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: "" },
    total: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending_payment", "paid", "preparing", "shipped", "delivered", "cancelled"],
      default: "pending_payment",
    },

    payment: {
      token: { type: String },
      transactionId: { type: String },
      authorizationCode: { type: String },
      amount: { type: Number },
      paidAt: { type: Date },
    },
  },
  { timestamps: true }
);

export default models.Order || model("Order", OrderSchema);
