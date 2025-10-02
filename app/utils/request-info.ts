import { useRouteLoaderData } from "react-router";
import type { loader as rootLoader } from "~/root";

/**
 * @returns the request info from the root loader
 */
export function useRequestInfo() {
  const data = useRouteLoaderData<typeof rootLoader>("root");
  return data?.requestInfo;
}
