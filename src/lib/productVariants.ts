export type ProductVariant = {
  talla: string;
  color: string;
  stock: number;
  sku: string;
};

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeDimension(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function toStock(value: unknown) {
  const parsed = Math.floor(Number(value ?? 0));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function buildVariantKey(selection: { talla?: unknown; color?: unknown }) {
  return `${cleanText(selection.talla, 40)}__${cleanText(selection.color, 40)}`;
}

export function normalizeProductVariants(rawVariants: unknown): ProductVariant[] {
  if (!Array.isArray(rawVariants)) return [];

  const merged = new Map<string, ProductVariant>();

  for (const entry of rawVariants) {
    if (!entry || typeof entry !== "object") continue;

    const raw = entry as Record<string, unknown>;
    let talla = cleanText(raw.talla, 40);
    let color = cleanText(raw.color, 40);

    const legacyName = normalizeDimension(cleanText(raw.name, 20));
    const legacyValue = cleanText(raw.value, 40);
    if (!talla && legacyName === "talla") talla = legacyValue;
    if (!color && legacyName === "color") color = legacyValue;

    if (!talla && !color) continue;

    const key = buildVariantKey({ talla, color });
    const previous = merged.get(key);

    merged.set(key, {
      talla,
      color,
      stock: (previous?.stock ?? 0) + toStock(raw.stock),
      sku: cleanText(raw.sku, 80) || previous?.sku || "",
    });
  }

  return [...merged.values()];
}

export function hasProductVariants(rawVariants: unknown) {
  return normalizeProductVariants(rawVariants).length > 0;
}

export function getProductStock(rawVariants: unknown, fallbackStock: unknown) {
  const variants = normalizeProductVariants(rawVariants);
  if (!variants.length) return toStock(fallbackStock);
  return variants.reduce((sum, variant) => sum + variant.stock, 0);
}

export function findProductVariant(
  rawVariants: unknown,
  selection: { talla?: unknown; color?: unknown }
) {
  const key = buildVariantKey(selection);
  return normalizeProductVariants(rawVariants).find((variant) => buildVariantKey(variant) === key) ?? null;
}
