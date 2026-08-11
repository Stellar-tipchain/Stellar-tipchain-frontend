import { txUrl } from "@/utils/explorer";
import { truncateHash } from "@/utils/format";
import { cn } from "@/lib/cn";

interface TxLinkProps {
  hash: string;
  className?: string;
}

/**
 * Links a transaction hash to the block explorer so the user can verify the
 * payment landed without taking the app's word for it.
 */
export default function TxLink({ hash, className }: TxLinkProps) {
  return (
    <a
      href={txUrl(hash)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("font-mono underline underline-offset-2 hover:no-underline", className)}
    >
      {truncateHash(hash)}
      <span className="sr-only"> (opens the block explorer in a new tab)</span>
    </a>
  );
}
