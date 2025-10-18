import { parseWithZod } from "@conform-to/zod/v4";
import { invariantResponse } from "@epic-web/invariant";
import { data } from "react-router";
import { z } from "zod/v4";
import { setKudosCookie } from "~/utils/kudos.server";
import type { Route } from "./+types/kudos";

const KudosActionSchema = z.object({
  slug: z.string().min(1),
  fingerprint: z.string().min(1),
});

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: KudosActionSchema,
  });

  invariantResponse(
    submission.status === "success",
    "Invalid kudos data received",
  );

  const { slug, fingerprint } = submission.value;

  // Get IP from Cloudflare headers
  const ip = request.headers.get("cf-connecting-ip") || "";

  // Call Durable Object directly
  const env = context.cloudflare.env;
  const id = env.KUDOS_DO.idFromName(`kudos:${slug}`);
  const stub = env.KUDOS_DO.get(id);

  const url = new URL(request.url);
  const response = await stub.fetch(new URL("/increment", url.origin), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fingerprint, ip }),
  });

  const result: {
    ok?: boolean;
    total?: number;
    you?: number;
    reason?: string;
  } = await response.json();

  // Set cookie with user's kudos count if successful
  const headers = new Headers();
  if (result.ok && result.you !== undefined) {
    headers.append("Set-Cookie", setKudosCookie(slug, result.you));
  }

  return data(
    {
      result: {
        ok: result.ok,
        total: result.total,
        you: result.you,
        reason: result.reason,
        slug,
      },
    },
    { status: response.status, headers },
  );
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return data({ total: 0 }, { status: 400 });
  }

  // Call Durable Object directly
  const env = context.cloudflare.env;
  const id = env.KUDOS_DO.idFromName(`kudos:${slug}`);
  const stub = env.KUDOS_DO.get(id);

  const response = await stub.fetch(new URL("/count", url.origin));
  const result: { total?: number } = await response.json();

  return data({ total: result.total ?? 0, slug });
}
