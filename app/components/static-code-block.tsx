export interface CodeProps {
  highlightedHtml: string;
}

export const Code = ({ highlightedHtml }: CodeProps) => {
  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: required by shiki
    <div dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
  );
};
