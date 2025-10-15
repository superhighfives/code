import { NavLink as Link, useRouteLoaderData } from "react-router";
import type { loader as rootLoader } from "~/root";
import { ThemeSwitch } from "~/routes/resources/theme-switch";

function navLinkClass({ isActive }: { isActive: boolean }) {
  let className =
    "border-b-2 font-medium hover:text-indigo-500 hover:dark:text-indigo-300";
  className += isActive
    ? " text-indigo-500 dark:text-indigo-300 border-indigo-500 dark:border-indigo-300"
    : " border-indigo-600/20 dark:border-indigo-400/30 hover:border-current hover:border-indigo-600/20 hover:dark:border-indigo-400/30";
  return className;
}

export default function Page({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof rootLoader>("root");

  return (
    <div className="grid grid-rows-layout gap-8 min-h-dvh p-8 pb-28 text-indigo-600 dark:text-indigo-400 overflow-x-hidden">
      <div className="content-end">{children}</div>
      <div className="flex justify-between border-t dark:border-gray-800 px-8 pt-4 pb-12 fixed inset-x-0 bottom-0 bg-gray-50 dark:bg-gray-900 drop-shadow-2xl">
        <div className="flex gap-6">
          <Link to="/" className="flex gap-1 leading-tight select-none">
            <span>{"❯"}</span>
            <span className="animate-blink step">█</span>
          </Link>
          <Link to="/" className={navLinkClass}>
            Home
          </Link>
          <Link to="/about" className={navLinkClass}>
            About
          </Link>
        </div>
        <div className="flex gap-6">
          <ThemeSwitch userPreference={data?.requestInfo.userPrefs.theme} />
        </div>
      </div>
    </div>
  );
}
