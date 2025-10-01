// import { initWasm as initResvg, Resvg } from "@resvg/resvg-wasm";
import type { SatoriOptions } from "satori";
import satori, { init as initSatori } from "satori/standalone";
// import resvgWasm from "~/vendor/resvg.wasm?url";
import yogaWasm from "~/vendor/yoga.wasm?url";
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

// Initialize WASM modules at global scope
let satoriInitialized = false;
// let resvgInitialized = false;

// Initialize satori with yoga WASM at global scope
async function initializeSatori() {
  if (!satoriInitialized) {
    try {
      await initSatori(yogaWasm);
      satoriInitialized = true;
    } catch (e) {
      console.error("Failed to initialize satori:", e);
      throw e;
    }
  }
}

// Initialize resvg WASM at global scope
// async function initializeResvg() {
//   if (!resvgInitialized) {
//     try {
//       await initResvg(resvgWasm);
//       resvgInitialized = true;
//     } catch (e) {
//       console.error("Failed to initialize resvg:", e);
//       throw e;
//     }
//   }
// }

export async function loader({ request, params }: Route.LoaderArgs) {
  const { origin, searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  // Initialize WASM modules
  await Promise.all([initializeSatori()]);

  try {
    // if (!slug) {
    //   throw new Error("No slug provided");
    // }

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
      title: "Hello",
      description: "World",
    };

    const options: SatoriOptions = {
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      fonts: [
        // {
        //   name: "JetBrainsMono-Semibold",
        //   data: await loadGoogleFont({ family: "JetBrains Mono", weight: 600 }),
        //   style: "normal",
        // },
      ],
    };

    console.log("satori");

    const svg = await satori(
      <div
        style={{
          width: options.width,
          height: options.height,
          background: `url(${origin}/social-default.png)`,
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

    console.log("satori complete");

    return new Response(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
      },
    });

    // Convert the SVG to PNG with "resvg"
    // const resvg = new Resvg(svg);
    // const pngData = resvg.render();
    // return new Response(pngData.asPng() as BodyInit, {
    //   status: 200,
    //   headers: {
    //     "Content-Type": "image/png",
    //     "cache-control": "public, immutable, no-transform, max-age=31536000",
    //   },
    // });
  } catch (e) {
    const url = new URL(origin);
    url.pathname = "/social-default.png";
    const png = await fetch(url).then((res) => res.body);
    return new Response(png, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "cache-control": "public, immutable, no-transform, max-age=31536000",
      },
    });
  }
}
