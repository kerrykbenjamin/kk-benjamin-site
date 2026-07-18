import "server-only";
import { cache } from "react";
import { isEditorRequest } from "@/lib/auth";

/** Request-scoped editor check (dedupes JWT verification across many fields). */
export const getIsEditor = cache(isEditorRequest);
