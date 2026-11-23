import { collections } from "@/lib/collections";
import { detailRoute } from "@/lib/http";

const route = detailRoute("locations");

export const GET = route.GET;
export const OPTIONS = route.OPTIONS;

/** Pre-render every known entry at build time; unknown ids still resolve at runtime (404). */
export function generateStaticParams() {
  return collections.locations.items.map((item) => ({ id: item.id }));
}
