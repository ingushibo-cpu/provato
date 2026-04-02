import "server-only";

import { createCaller } from "@provato/api";
import { createTRPCContext } from "@/lib/trpc-context";

export async function createServerCaller() {
  const ctx = await createTRPCContext();
  return createCaller(ctx);
}
