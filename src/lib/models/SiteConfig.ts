import mongoose, { Schema, Document } from "mongoose";

export interface ISiteConfig extends Document {
  key: string; // "main" — solo un documento
  banners: {
    image: string;
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
  }[];
  heroTitle: string;
  heroSubtitle: string;
  updatedAt: Date;
}

const SiteConfigSchema = new Schema<ISiteConfig>({
  key: { type: String, default: "main", unique: true },
  banners: [
    {
      image:     { type: String, default: "" },
      title:     { type: String, default: "" },
      subtitle:  { type: String, default: "" },
      ctaLabel:  { type: String, default: "Ver tienda" },
      ctaHref:   { type: String, default: "/catalogo" },
    },
  ],
  heroTitle:    { type: String, default: "Lookilla Store" },
  heroSubtitle: { type: String, default: "Accesorios que encantan" },
  updatedAt:    { type: Date, default: Date.now },
});

export default mongoose.models.SiteConfig ||
  mongoose.model<ISiteConfig>("SiteConfig", SiteConfigSchema);
