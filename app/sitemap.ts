import type { MetadataRoute } from "next";
import { collectionKeys } from "@/lib/collections";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/docs", "/explore", ...collectionKeys.map((k) => `/explore/${k}`)].map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "weekly",
  }));
}
