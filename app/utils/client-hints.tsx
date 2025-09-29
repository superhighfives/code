/**
 * This file contains utilities for using client hints for user preference which
 * are needed by the server, but are only known by the browser.
 */
import { getHintUtils } from "@epic-web/client-hints";
import {
  clientHint as colourSchemeHint,
  subscribeToSchemeChange,
} from "@epic-web/client-hints/color-scheme";
import { useEffect } from "react";
import { useRevalidator } from "react-router";
import { useRequestInfo } from "./request-info";

const hintsUtils = getHintUtils({ theme: colourSchemeHint });

export const { getHints } = hintsUtils;

/**
 * @returns an object with the client hints and their values
 */
export function useHints() {
  const requestInfo = useRequestInfo();
  return requestInfo.hints;
}

/**
 * @returns inline script element that checks for client hints and sets cookies
 * if they are not set then reloads the page if any cookie was set to an
 * inaccurate value.
 */
export function ClientHintCheck() {
  const { revalidate } = useRevalidator();
  useEffect(() => {
    subscribeToSchemeChange(() => revalidate());
  }, [revalidate]);

  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: required for client hints
      dangerouslySetInnerHTML={{
        __html: hintsUtils.getClientHintCheckScript(),
      }}
    />
  );
}
