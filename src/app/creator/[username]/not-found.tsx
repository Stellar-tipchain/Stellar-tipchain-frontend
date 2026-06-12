import Link from "next/link";

export default function NotFound() {
  return (
    <section className="max-w-lg mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center">
      <h1 className="text-3xl font-bold">Creator not found</h1>
      <Link href="/explore" className="text-blue-400 hover:text-blue-300 transition">
        Back to Explore
      </Link>
    </section>
  );
}
