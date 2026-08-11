import Link from "next/link";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { IS_MAINNET } from "@/config/env";
import { ROUTES } from "@/constants";

const STEPS = [
  {
    title: "Connect a wallet",
    body: "Freighter signs every payment in your browser. Your key never leaves the extension.",
  },
  {
    title: "Find a creator",
    body: "Browse the explore page or go straight to a profile at /creator/username.",
  },
  {
    title: "Send a tip",
    body: "Pay in XLM or any asset the creator accepts, with an optional on-chain message.",
  },
];

export default function Home() {
  return (
    <>
      <section className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight">Stellar Tipchain</h1>
        <p className="text-lg text-gray-400 max-w-xl">
          Support your favorite creators by sending tips using Stellar assets — fast, cheap, and
          open. No platform fee beyond the network&rsquo;s fraction of a cent.
        </p>

        {!IS_MAINNET && (
          <p className="text-sm text-amber-400">
            Running on testnet — tips sent here carry no real value.
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-4">
          <Link href={ROUTES.explore}>
            <Button>Explore Creators</Button>
          </Link>
          <Link href={ROUTES.tips}>
            <Button variant="outline">Send a Tip</Button>
          </Link>
          <Link href={ROUTES.register}>
            <Button variant="outline">Register as Creator</Button>
          </Link>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-semibold mb-6 text-center">How it works</h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <Card as="li" key={step.title} className="flex flex-col gap-2">
              <span className="text-blue-400 text-sm font-semibold">Step {index + 1}</span>
              <h3 className="font-medium">{step.title}</h3>
              <p className="text-sm text-gray-400">{step.body}</p>
            </Card>
          ))}
        </ol>
      </section>
    </>
  );
}
