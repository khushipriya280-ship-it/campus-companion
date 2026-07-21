import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { z } from "zod";
//#region src/routes/auth.tsx
var $$splitComponentImporter = () => import("./auth-CkUcBRtI.js");
var searchSchema = z.object({ mode: z.enum([
	"signin",
	"signup",
	"forgot"
]).optional() });
var Route = createFileRoute("/auth")({
	validateSearch: searchSchema,
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
