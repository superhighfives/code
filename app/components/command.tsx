export default function Command({
  highlightedHtml,
}: {
  highlightedHtml: string;
}) {
  return (
    <div
      className="relative border p-4 rounded-sm shadow-md bg-gray-50 dark:bg-gray-950 border-gray-300 dark:border-gray-700 mt-4 break-words [&>pre>code]:whitespace-pre-wrap"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: required by shiki
      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
    />
  );
}
