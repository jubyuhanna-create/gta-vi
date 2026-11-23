import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x py-32 text-center">
      <p className="glow-pink animate-flicker font-mono text-7xl font-black text-neon-pink">404</p>
      <h1 className="mt-4 text-2xl font-bold text-white">Wasted.</h1>
      <p className="mt-2 text-zinc-400">This page doesn&apos;t exist anywhere in Leonida.</p>
      <Link href="/" className="btn-pink mt-8">
        Respawn at home
      </Link>
    </div>
  );
}
