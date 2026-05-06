import Link from "next/link";

interface CreatorCardProps {
  username: string;
  bio?: string;
}

export default function CreatorCard({ username, bio }: CreatorCardProps) {
  return (
    <Link
      href={`/creator/${username}`}
      className="flex flex-col items-center gap-2 p-5 rounded-xl bg-gray-800 hover:bg-gray-700 transition text-center"
    >
      <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xl">
        {username[0].toUpperCase()}
      </div>
      <span className="font-medium">@{username}</span>
      {bio && <p className="text-xs text-gray-400 line-clamp-2">{bio}</p>}
    </Link>
  );
}
