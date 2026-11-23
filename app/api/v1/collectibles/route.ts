import { listRoute } from "@/lib/http";

const route = listRoute("collectibles");

export const GET = route.GET;
export const OPTIONS = route.OPTIONS;
