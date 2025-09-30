import { ImageResponse, loadGoogleFont } from "workers-og";
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

export async function loader({ request, params }: Route.LoaderArgs) {
  try {
    const { origin, searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    // if (!slug) {
    //   throw new Error("No slug provided");
    // }

    // const url = new URL(requestUrl);
    // url.pathname = `/${slug}.json`;
    // const data: PostMeta = await fetch(url).then(
    //   async (res) => await res.json(),
    // );

    // if (!data) {
    //   throw new Error("No data found");
    // }

    // const { title, description } = data.frontmatter;

    // const { default: resvgwasm } = await import(
    //   /* @vite-ignore */ `${RESVG_WASM}?module`
    // );
    // const { default: yogawasm } = await import(
    //   /* @vite-ignore */ `${YOGA_WASM}?module`
    // );

    // try {
    //   if (!initialised) {
    //     await initResvg(resvgwasm);
    //     await initSatori(await initYoga(yogawasm));
    //     initialised = true;
    //   }
    // } catch (_e) {
    //   initialised = true;
    // }

    const { title, description } = {
      title: "Hello",
      description: "World",
    };

    const options = {
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

    // Design the image and generate an SVG with "satori"
    return new ImageResponse(
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
  } catch (e) {
    console.log(e);
    const url = new URL(origin);
    url.pathname = "/social-default.png";
    return await fetch(url).then((res) => res.body);
  }
}
