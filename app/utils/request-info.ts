import { invariant } from "@epic-web/invariant";
import { useRouteLoaderData } from "react-router";
import type { loader as rootLoader } from "~/root";

/**
 * @returns the request info from the root loader
 */
export function useRequestInfo() {
  const data = useRouteLoaderData<typeof rootLoader>("root");
  console.log("useRequestInfo data:", data);
  invariant(data?.requestInfo, "No requestInfo found in root loader");
  return data.requestInfo;
}
