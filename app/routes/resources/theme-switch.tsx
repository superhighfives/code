import { getFormProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { invariantResponse } from "@epic-web/invariant";
import type { ActionFunctionArgs } from "react-router";
import { useFetcher } from "react-router";
import { z } from "zod/v4";
import { useHints } from "~/utils/client-hints";
import { useRequestInfo } from "~/utils/request-info";
import type { Theme } from "~/utils/theme.server";
import { setTheme } from "~/utils/theme.server";

const ThemeFormSchema = z.object({
  theme: z.enum(["system", "light", "dark"]),
});

export async function action({ request }: ActionFunctionArgs) {
  console.log("calling action from theme-switch");
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: ThemeFormSchema });

  invariantResponse(submission.status === "success", "Invalid theme received");

  const { theme } = submission.value;

  const responseInit = {
    headers: { "set-cookie": setTheme(theme) },
  };
  return Response.json({ result: submission.reply() }, responseInit);
}

export function ThemeSwitch({
  userPreference,
}: {
  userPreference?: Theme | null;
}) {
  const fetcher = useFetcher<typeof action>();

  const [form] = useForm({
    id: "theme-switch",
    lastResult: fetcher.data?.result,
  });

  const mode = userPreference ?? "system";
  console.log("userPreference", userPreference);
  const nextMode =
    mode === "system" ? "light" : mode === "light" ? "dark" : "system";
  console.log("mode", mode);
  console.log("nextMode", nextMode);
  const modeLabel = {
    light: <span>Light</span>,
    dark: <span>Dark</span>,
    system: <span>System</span>,
  };

  return (
    <fetcher.Form
      method="POST"
      {...getFormProps(form)}
      action="/resources/theme-switch"
    >
      <input type="hidden" name="theme" value={nextMode} />
      <div>
        <button type="submit">{modeLabel[mode]}</button>
      </div>
    </fetcher.Form>
  );
}

/**
 * @returns the client hint theme.
 */
export function useTheme() {
  const hints = useHints();
  console.log("calling request info from useTheme");
  const requestInfo = useRequestInfo();
  return requestInfo.userPrefs.theme ?? hints.theme;
}
