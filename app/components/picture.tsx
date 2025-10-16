import { useTheme } from "~/routes/resources/theme-switch";

export default function Picture({
  src,
  themed = false,
  alt,
}: {
  src: string;
  themed: boolean;
  alt: string;
}) {
  const theme = useTheme();
  const baseImage = `${src}`;
  const darkImage = `${baseImage.split(".").join("-dark.")}`;

  return (
    <picture
      className={`overflow-hidden rounded shadow-sm w-full align-top my-0`}
    >
      {theme === "dark" && themed ? <source srcSet={darkImage} /> : null}
      <img src={baseImage} className="w-full" alt={alt} />
    </picture>
  );
}
