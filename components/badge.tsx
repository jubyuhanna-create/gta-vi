export function VerifiedBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-neon-cyan/40 bg-neon-cyan/10 px-2 py-0.5 text-[11px] font-semibold text-neon-cyan">
      ✓ Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-neon-sun/40 bg-neon-sun/10 px-2 py-0.5 text-[11px] font-semibold text-neon-sun">
      ? Unconfirmed
    </span>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-zinc-400">{children}</span>;
}
