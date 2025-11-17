import Link from "next/link";

async function getTweet(id) {
  const res = await fetch(`https://dummyjson.com/posts/${id}`);
  return res.json();
}

export default async function TweetDetail({ params }) {
    const { id } = await params;
    const tweet = await getTweet(id);

    return (
        <main className="p-16 bg-white dark:bg-black min-h-screen flex flex-col space-x-10">
            <h1>{tweet.title}</h1>
            <p>{tweet.body}</p>
            <p>
                👍 {tweet.reactions.likes} | 👎 {tweet.reactions.dislikes}
            </p>
            <Link href="/" className="mt-10 text-blue-500 hover:underline">
                ← Back to Feed
            </Link>
        </main>
    );
}