import { apiRoute, corsPreflight, postRoutes } from "@acme/api";

import { auth } from "~/auth/server";

export const OPTIONS = corsPreflight;
export const GET = apiRoute(auth, postRoutes.list);
export const POST = apiRoute(auth, postRoutes.create);
