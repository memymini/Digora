import { headers } from "next/headers";
import type { UserPayload } from "../types";

/**
 * This is a server-side utility to get the user payload from the request headers
 * that were set by the middleware.
 */
export const getCurrentUser = async (): Promise<UserPayload | null> => {
  const headersList = headers();
  const userPayloadHeader = (await headersList).get("x-user-payload");

  if (!userPayloadHeader) {
    return null;
  }

  try {
    return JSON.parse(userPayloadHeader);
  } catch (e) {
    console.error("Failed to parse user payload from header", e);
    return null;
  }
};
