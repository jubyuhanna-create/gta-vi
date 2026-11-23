import { listRoute } from "@/lib/http";

const route = listRoute("weapons");

export const GET = route.GET;
export const OPTIONS = route.OPTIONS;
