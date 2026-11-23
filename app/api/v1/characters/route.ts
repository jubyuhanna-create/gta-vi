import { listRoute } from "@/lib/http";

const route = listRoute("characters");

export const GET = route.GET;
export const OPTIONS = route.OPTIONS;
