import { listRoute } from "@/lib/http";

const route = listRoute("locations");

export const GET = route.GET;
export const OPTIONS = route.OPTIONS;
