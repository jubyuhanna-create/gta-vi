import { listRoute } from "@/lib/http";

const route = listRoute("vehicles");

export const GET = route.GET;
export const OPTIONS = route.OPTIONS;
