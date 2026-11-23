import { collections } from "@/lib/collections";
import { detailRoute } from "@/lib/http";

const route = detailRoute("radio");

export const GET = route.GET;
export const OPTIONS = route.OPTIONS;

/** Pre-render every known entry at build time; unknown ids still resolve at runtime (404). */
export function generateStaticParams() {
  return collections.radio.items.map((item) => ({ id: item.id }));
}
