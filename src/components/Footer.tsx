import Link from "next/link";
import { IS_MAINNET, NETWORK } from "@/config/env";
import { ROUTES } from "@/constants";

/** Site footer: navigation, the active network, and where the code lives. */
export default function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-16 px-6 py-8 text-sm text-gray-500">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>
          Built on{" "}
          <a
            href="https://stellar.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 underline underline-offset-2"
          >
            Stellar
          </a>
          {" · "}
          <span className={IS_MAINNET ? "text-gray-400" : "text-amber-400"}>
            {IS_MAINNET ? "Public network" : `${NETWORK} — tips carry no real value`}
          </span>
        </p>

        <nav aria-label="Footer">
          <ul className="flex items-center gap-4">
            <li>
              <Link href={ROUTES.explore} className="hover:text-gray-300">
                Explore
              </Link>
            </li>
            <li>
              <Link href={ROUTES.leaderboard} className="hover:text-gray-300">
                Leaderboard
              </Link>
            </li>
            <li>
              <a
                href="https://www.freighter.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300"
              >
                Get Freighter
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
