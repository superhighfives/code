export interface CodeProps {
  highlightedHtml: string;
}

export const Code = ({ highlightedHtml }: CodeProps) => {
  return (
    <div
      className="py-4"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: required by shiki
      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
    />
  );
};
