import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[80vh] gap-4 text-center">
      <h2 className="text-4xl font-bold">404 — Page Not Found</h2>
      <p className="text-gray-400">The page you are looking for does not exist.</p>
      <Link href="/" className="text-blue-400 hover:underline">
        Go home
      </Link>
    </section>
  );
}
