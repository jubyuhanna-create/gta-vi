import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5 py-10 text-sm text-zinc-500">
      <div className="container-x flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="text-zinc-300">{site.name}</span> · MIT licensed
        </p>
        <p className="max-w-xl text-xs leading-relaxed">
          Unofficial fan project. Not affiliated with, endorsed or sponsored by Rockstar Games or Take-Two Interactive.
          Grand Theft Auto and related names are trademarks of their respective owners.
        </p>
      </div>
    </footer>
  );
}
