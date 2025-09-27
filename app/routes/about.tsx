import type { Route } from "./+types/about";

export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE };
}

export default function About({ loaderData }: Route.ComponentProps) {
  return <h1>About: {loaderData.message}</h1>;
}
