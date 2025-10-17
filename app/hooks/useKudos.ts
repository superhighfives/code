import { useFetcher } from "react-router";
import { useUserFingerprint } from "~/root";

export function useKudos(slug: string, initialTotal = 0, initialYou = 0) {
  const fingerprint = useUserFingerprint();
  const fetcher = useFetcher<{
    result: { ok?: boolean; total?: number; you?: number; reason?: string };
  }>();

  // Get optimistic values from fetcher or use server values
  const total = fetcher.data?.result?.total ?? initialTotal;
  const you = fetcher.data?.result?.you ?? initialYou;

  const remaining = Math.max(0, 50 - you);
  const pending = fetcher.state !== "idle";
  // Only disable if we've confirmed no remaining kudos
  // Don't check fingerprint here to avoid hydration mismatch
  const disabled = remaining <= 0;

  return {
    fetcher,
    fingerprint,
    total,
    you,
    remaining,
    disabled,
    pending,
  };
}
