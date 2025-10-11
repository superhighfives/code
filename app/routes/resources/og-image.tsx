import { Buffer } from "node:buffer";
import { initWasm as initResvg, Resvg } from "@resvg/resvg-wasm";
import Replicate from "replicate";
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

let initialisationPromise: Promise<void> | null = null;

async function ensureInitialised() {
  if (!initialisationPromise) {
    initialisationPromise = (async () => {
      try {
        await initResvg(RESVG_WASM);
      } catch (e) {
        // Already initialized, ignore
      }
      try {
        initSatori(await initYoga(YOGA_WASM));
      } catch (e) {
        // Already initialized, ignore
      }
    })();
  }
  return initialisationPromise;
}

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const { slug } = params;

  const imageResponse = await context.assets.fetch(
    new URL(background, request.url),
  );
  const imageBuffer = await imageResponse.arrayBuffer();
  const imageBase64 = `data:image/png;base64,${Buffer.from(imageBuffer).toString("base64")}`;

  try {
    await ensureInitialised();

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

    const replicate = new Replicate({
      auth: context.cloudflare.env.REPLICATE_API_TOKEN,
    });

    const input = {
      prompt: `A ${slug} in the style of BLUEPRINT with lots of schematics and labels indicating each of the element of the ${slug}.`,
      output_format: "png",
    };

    const output = await replicate.run("black-forest-labs/flux-schnell", {
      input,
    });
    1;

    console.log(output[0].url());

    // const output =
    //   "https://replicate.delivery/xezq/9yuZVIxBfqWAOyCKzKf2WDSefDbo4seUgfUy9sGGQNF4ZYdXF/output.png";

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
          data: await loadGoogleFont({
            family: "JetBrains Mono",
            weight: 600,
          }),
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
        <img
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 570,
            mixBlendMode: "multiply",
            boxShadow: "0 0 10px 0 rgba(0, 0, 0, 1)",
          }}
          width={630}
          height={630}
          src={output[0].url().href}
          alt="Output"
        />
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
  } catch (e) {
    console.error("Render error", e);
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "cache-control": "public, immutable, no-transform, max-age=31536000",
      },
    });
  }
}
