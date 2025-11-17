import TweetCard from "@/components/TweetCard";
import Link from "next/link";

async function getTweets() {
  const res = await fetch("https://dummyjson.com/posts");
  return res.json();
}

export default async function Home() {
  const tweets = await getTweets();
  console.log('tweets', tweets);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Latest Tweets
          </h1>
              {tweets.posts.map((tweet) => (
                <Link href={`/tweet/${tweet.id}`} key={tweet.id}>
                  <TweetCard key={tweet.id} tweet={tweet} />
                </Link>
              ))}
        </div>
      </main>
    </div>
  );
}
