import { useKudos } from "~/hooks/useKudos";

interface KudosButtonProps {
  slug: string;
  initialTotal?: number;
  initialYou?: number;
}

export function KudosButton({
  slug,
  initialTotal = 0,
  initialYou = 0,
}: KudosButtonProps) {
  const { fetcher, fingerprint, total, remaining, disabled } = useKudos({
    initialTotal,
    initialYou,
  });

  return (
    <fetcher.Form method="POST" action="/kudos">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="fingerprint" value={fingerprint} />
      <button
        type="submit"
        disabled={disabled}
        aria-label="Give kudos"
        title={disabled ? "Limit reached" : "Give kudos"}
        className={`cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-indigo-600/20 dark:border-indigo-400/30 text-indigo-600 dark:text-indigo-400 transition-colors disabled:border-current/20 disabled:cursor-not-allowed ${disabled ? "" : "hover:text-indigo-500 hover:dark:text-indigo-300 hover:border-current"}`}
      >
        <span role="img" aria-hidden="true">
          👍
        </span>
        <span className="font-medium">{total ?? "—"}</span>
        <span className="text-xs opacity-70">
          {remaining ? `(${remaining} left)` : null}
        </span>
      </button>
    </fetcher.Form>
  );
}
