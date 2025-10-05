import { differenceInMonths, format, parseISO } from "date-fns";
import type { MetaData } from "~/lib/types";

export function getMetaData(data?: MetaData) {
  return (
    (data &&
      Object.entries(data).map(([key, value]) => {
        return { key, value };
      })) ||
    []
  );
}

export function processArticleDate(metadata: Array<{ key: string; value: string }>, date?: string) {
  if (!date) {
    return { updatedMetadata: metadata, isOldArticle: false };
  }

  const dateObject = parseISO(date);
  const updatedMetadata = [
    {
      key: "Last Updated",
      value: format(dateObject, "dd/MM/yyyy"),
    },
    ...metadata
  ];

  const isOldArticle = differenceInMonths(Date.now(), dateObject) >= 3;

  return { updatedMetadata, isOldArticle };
}
