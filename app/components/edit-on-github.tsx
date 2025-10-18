import { GitBranch, Github } from "lucide-react";

export default function EditOnGitHub({
  date,
  slug,
}: {
  date: string;
  slug: string;
}) {
  const formattedDate = date.split("T")[0];

  return (
    <a
      className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      href={`https://github.com/superhighfives/code.charliegleason.com/blob/main/posts/${formattedDate}.${slug}.mdx`}
    >
      <GitBranch size={16} />
      <span>Edit on GitHub</span>
    </a>
  );
}
