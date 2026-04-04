import DiscountCode from "@/lib/models/DiscountCode";

type DiscountValidationItem = {
  productId?: string;
  coleccion?: string;
};

type DiscountValidationInput = {
  code: string;
  amount: number;
  items?: DiscountValidationItem[];
};

export type DiscountValidationResult = {
  valid: boolean;
  message?: string;
  discountAmount?: number;
  finalAmount?: number;
  discountCode?: {
    code: string;
    appliesTo: string;
  };
};

export async function validateDiscountCode(input: DiscountValidationInput): Promise<DiscountValidationResult> {
  const code = input.code.trim().toUpperCase();
  const amount = Number(input.amount || 0);
  const items = input.items ?? [];

  if (!code) {
    return { valid: false, message: "Falta code" };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { valid: false, message: "Monto inválido" };
  }

  const discount = await DiscountCode.findOne({ code }).lean() as
    | {
        appliesTo: string;
        colecciones?: string[];
        endAt?: Date;
        isActive?: boolean;
        minOrderAmount?: number;
        productIds?: unknown[];
        startAt?: Date;
        type: string;
        usageLimit?: number;
        usedCount?: number;
        value: number;
      }
    | null;
  if (!discount || !discount.isActive) {
    return { valid: false, message: "Cupón inválido o inactivo" };
  }

  const now = new Date();
  if (discount.startAt && now < discount.startAt) {
    return { valid: false, message: "Cupón aún no disponible" };
  }
  if (discount.endAt && now > discount.endAt) {
    return { valid: false, message: "Cupón expirado" };
  }
  if (discount.usageLimit && (discount.usedCount ?? 0) >= discount.usageLimit) {
    return { valid: false, message: "Cupón sin cupos" };
  }
  if (discount.minOrderAmount && amount < discount.minOrderAmount) {
    return { valid: false, message: "No cumple mínimo" };
  }

  if (discount.appliesTo === "product") {
    const validProduct = items.some((item) =>
      discount.productIds?.some((productId) => String(productId) === String(item.productId))
    );

    if (!validProduct) {
      return { valid: false, message: "Cupón no aplica a este producto" };
    }
  }

  if (discount.appliesTo === "coleccion") {
    const validCollection = items.some((item) =>
      discount.colecciones?.includes(item.coleccion || "")
    );

    if (!validCollection) {
      return { valid: false, message: "Cupón no aplica a esta colección" };
    }
  }

  let discountAmount = discount.type === "percentage" ? (amount * discount.value) / 100 : discount.value;
  discountAmount = Math.min(discountAmount, amount);

  return {
    valid: true,
    discountAmount,
    finalAmount: Math.max(0, amount - discountAmount),
    discountCode: {
      code,
      appliesTo: discount.appliesTo,
    },
  };
}
