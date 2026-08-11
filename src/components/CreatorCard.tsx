import Link from "next/link";
import { ROUTES } from "@/constants";
import { pluralize } from "@/utils/format";
import Avatar from "./Avatar";

interface CreatorCardProps {
  username: string;
  bio?: string;
  tipCount?: number;
}

export default function CreatorCard({ username, bio, tipCount }: CreatorCardProps) {
  return (
    <Link
      href={ROUTES.creator(username)}
      className="flex flex-col items-center gap-2 p-5 rounded-xl bg-gray-800 hover:bg-gray-700 transition text-center h-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
    >
      <Avatar name={username} />
      <span className="font-medium">@{username}</span>
      {bio && <p className="text-xs text-gray-400 line-clamp-2">{bio}</p>}
      {tipCount !== undefined && (
        <span className="text-xs text-gray-500">{pluralize(tipCount, "tip")} received</span>
      )}
    </Link>
  );
}
