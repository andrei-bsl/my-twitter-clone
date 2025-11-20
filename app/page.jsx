import TweetCard from "@/components/TweetCard";
import Link from "next/link";

async function getTweets() {
  // Use absolute URL for server-side fetch in production
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/tweets`, {
    cache: "no-store", // Always get fresh data
  });

  if (!res.ok) {
    throw new Error("Failed to fetch tweets");
  }

  return res.json();
}

export default async function Home() {
  const tweets = await getTweets();

  return (
    <main className="container mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-center my-6 text-gray-900 dark:text-white">
        📝 Latest Tweets
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tweets.posts.map((tweet) => (
          <Link href={`/tweet/${tweet.id}`} key={tweet.id}>
            <TweetCard tweet={tweet} />
          </Link>
        ))}
      </div>
    </main>
  );
}
