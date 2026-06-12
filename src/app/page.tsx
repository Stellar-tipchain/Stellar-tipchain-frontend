import Link from "next/link";
import Button from "@/components/Button";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-4 text-center">
      <h1 className="text-5xl font-bold tracking-tight">Stellar Tipchain</h1>
      <p className="text-lg text-gray-400 max-w-xl">
        Support your favorite creators by sending tips using Stellar assets — fast, cheap, and open.
      </p>
      <div className="flex gap-4">
        <Link href="/explore">
          <Button>Explore Creators</Button>
        </Link>
        <Link href="/tips">
          <Button variant="outline">Send a Tip</Button>
        </Link>
        <Link href="/register">
          <Button variant="outline">Register as Creator</Button>
        </Link>
      </div>
    </section>
  );
}
