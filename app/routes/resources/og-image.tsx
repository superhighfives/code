import { env } from "cloudflare:workers";
import { Buffer } from "node:buffer";
import { initWasm as initResvg, Resvg } from "@resvg/resvg-wasm";
import type { SatoriOptions } from "satori";
import satori, { init as initSatori } from "satori/wasm";
import { loadGoogleFont } from "workers-og";
import initYoga from "yoga-wasm-web";
import background from "~/assets/social-background.png";
// @ts-expect-error: wasm is untyped in Vite
import RESVG_WASM from "../../vendor/resvg.wasm";
// @ts-expect-error: wasm is untyped in Vite
import YOGA_WASM from "../../vendor/yoga.wasm";
import type { Route } from "./+types/og-image";

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export type Frontmatter = {
  title: string;
  description: string;
  published: string;
  featured: boolean;
  draft: boolean;
  data: [];
  links: [];
};

export type PostMeta = {
  slug: string;
  url?: string;
  date?: Date;
  frontmatter: Frontmatter;
};

let initialised = false;

export async function loader({ request, params }: Route.LoaderArgs) {
  const { slug } = params;

  const imageResponse = await env.ASSETS.fetch(
    new URL(background, request.url),
  );
  const imageBuffer = await imageResponse.arrayBuffer();
  const imageBase64 = `data:image/png;base64,${Buffer.from(imageBuffer).toString("base64")}`;

  try {
    if (!initialised) {
      await initResvg(RESVG_WASM);
      initSatori(await initYoga(YOGA_WASM));
      initialised = true;
    }

    if (!slug) {
      throw new Error("No slug provided");
    }

    // const url = new URL(origin);
    // url.pathname = `/${slug}.json`;
    // const data: PostMeta = await fetch(url).then(
    //   async (res) => await res.json(),
    // );

    // if (!data) {
    //   throw new Error("No data found");
    // }

    // const { title, description } = data.frontmatter;

    const { title, description } = {
      title: slug,
      description: "World",
    };

    const options: SatoriOptions = {
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      fonts: [
        {
          name: "JetBrainsMono-Semibold",
          data: await loadGoogleFont({ family: "JetBrains Mono", weight: 600 }),
          style: "normal",
        },
      ],
    };

    const svg = await satori(
      <div
        style={{
          width: options.width,
          height: options.height,
          background: `url("${imageBase64}")`,
          backgroundSize: "1200 630",
          padding: "100px",
          color: "white",
          gap: "24",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "block",
            fontSize: 60,
            lineClamp: 2,
            lineHeight: 1.25,
          }}
        >
          {title}
        </div>
        {description ? (
          <div
            style={{
              display: "block",
              fontSize: 30,
              lineClamp: 2,
              lineHeight: 1.5,
            }}
          >
            {description}
          </div>
        ) : null}
      </div>,
      options,
    );

    // Convert the SVG to PNG with "resvg"
    const resvg = new Resvg(svg);
    const pngData = resvg.render();
    return new Response(pngData.asPng() as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "cache-control": "no-cache",
      },
    });
  } catch (_e) {
    initialised = true;
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "cache-control": "public, immutable, no-transform, max-age=31536000",
      },
    });
  }
}
