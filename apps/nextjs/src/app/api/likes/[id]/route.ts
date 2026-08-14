import { apiRoute, corsPreflight, likeRoutes } from "@acme/api";

import { auth } from "~/auth/server";

export const OPTIONS = corsPreflight;
export const DELETE = apiRoute(auth, likeRoutes.remove);
