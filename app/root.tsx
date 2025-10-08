import { getSandpackCssText } from "@codesandbox/sandpack-react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import stylesheet from "~/global.css?url";
import { useTheme } from "~/routes/resources/theme-switch";
import type { Theme } from "~/utils/theme.server";
import { getTheme } from "~/utils/theme.server";
import type { Route } from "./+types/root";
import ErrorView from "./components/error-view";
import Page from "./components/page";
import { ClientHintCheck, getHints } from "./utils/client-hints";

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap",
  },
  {
    rel: "icon",
    href: "/favicon.png",
    type: "image/png",
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  return {
    requestInfo: {
      hints: getHints(request),
      path: new URL(request.url).pathname,
      userPrefs: {
        theme: getTheme(request),
      },
    },
    sandpackCss: getSandpackCssText(),
  };
}

function Document({
  children,
  theme = "light",
  sandpackCss,
}: {
  children: React.ReactNode;
  theme?: Theme;
  sandpackCss?: string;
}) {
  return (
    <html lang="en" className={theme}>
      <head>
        <ClientHintCheck />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {sandpackCss && (
          // biome-ignore lint/correctness/useUniqueElementIds: sandpack css
          <style
            // biome-ignore lint/security/noDangerouslySetInnerHtml: sandpack css
            dangerouslySetInnerHTML={{ __html: sandpackCss }}
            id="sandpack"
          />
        )}
      </head>
      <body className="font-mono text-sm bg-white dark:bg-gray-950">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  const theme = useTheme();
  return (
    <Document theme={theme} sandpackCss={loaderData.sandpackCss}>
      <Page>
        <Outlet />
      </Page>
    </Document>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <Document>
      <Page>
        <ErrorView error={error} />
      </Page>
    </Document>
  );
}
