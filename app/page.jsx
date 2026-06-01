// 📝 EXERCISE 1: Home Page - Data Fetching & Rendering
// 
// 🎯 Goal: Complete the API fallback and render tweets in a grid
//
// 📚 What you'll learn:
// - Fetching data with async/await
// - Error handling with fetch API
// - Rendering lists with .map()
// - Next.js Link component for navigation
//
// ✅ Your Tasks:
// 1. Complete the API fallback in getTweets() (see TODO #1)
// 2. Complete the tweets grid mapping (see TODO #2)

import TweetCard from "@/components/TweetCard";
import FavoritesList from "@/components/FavoritesList";
import Link from "next/link";
import { Tweet } from "@/models/Tweet";
import { Reaction } from "@/models/Reaction";
import { isDatabaseEnabled, makeSureDbIsReady } from "@/lib/db";

// 🎓 RENDERING STRATEGIES SHOWCASE (for teaching purposes)
// Uncomment ONE of the following to demonstrate different Next.js rendering modes:

// ✅ CURRENTLY ACTIVE: ISR (Incremental Static Regeneration)
// - Page is cached and regenerated every 60 seconds
// - Best balance: fast loading + fresh data
export const revalidate = 60;

// 🔄 OPTION 1: SSR (Server-Side Rendering)
// Uncomment this to fetch fresh data on EVERY request (slower but always fresh)
// export const dynamic = 'force-dynamic';

// 📦 OPTION 2: SSG (Static Site Generation)
// Uncomment this to cache forever (fastest but data frozen at build time)
// export const revalidate = false;

// 💡 COMPARISON:
// SSG (revalidate = false):     Build once → Cache forever → Fastest ⚡
// ISR (revalidate = 60):        Build → Cache 60s → Regenerate → Fast + Fresh 🔄
// SSR (dynamic = 'force-dynamic'): Fetch every request → Slowest but always current 🐌

async function getTweets() {
  // Check if database should be used
  const shouldUseDatabase = isDatabaseEnabled();
  
  if (shouldUseDatabase) {
    try {
      await makeSureDbIsReady();
      const tweets = await Tweet.find({}).sort({ createdAt: -1 }).lean();
      
      // Fetch reaction counts for all tweets
      const tweetIds = tweets.map(t => t._id.toString());
      const reactionCounts = await Reaction.aggregate([
        { $match: { sourceType: "tweet", sourceId: { $in: tweetIds } } },
        { $group: {
            _id: { sourceId: "$sourceId", type: "$type" },
            count: { $sum: 1 }
          }
        }
      ]);
      
      // Create a map of reaction counts
      const reactionMap = {};
      reactionCounts.forEach(({ _id, count }) => {
        if (!reactionMap[_id.sourceId]) {
          reactionMap[_id.sourceId] = { likes: 0, dislikes: 0 };
        }
        reactionMap[_id.sourceId][_id.type === "like" ? "likes" : "dislikes"] = count;
      });
      
      const formattedTweets = tweets.map((tweet) => ({
        id: tweet._id.toString(),
        title: tweet.title,
        body: tweet.body,
        tags: tweet.tags,
        reactions: reactionMap[tweet._id.toString()] || { likes: 0, dislikes: 0 },
        views: tweet.views,
        userId: tweet.userId,
      }));
      
      return { posts: formattedTweets };
    } catch (error) {
      console.warn("⚠️ Database error, falling back to external API:", error.message);
    }
  }

  const res = await fetch("https://dummyjson.com/posts");

  if (!res.ok) {
    throw new Error("Failed to fetch tweets");
  }

  console.log("Fetched tweets from external API");

  return res.json();


}

export default async function Home() {
  const tweets = await getTweets();
  const generatedAt = new Date().toLocaleString();

  return (
    <main className="container mx-auto p-6 min-h-screen">
      <div className="flex justify-between items-center my-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          📝 Latest Tweets
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-semibold">ISR Enabled</span> • Generated at {generatedAt}
        </div>
      </div>
      
      {/* Favorites Section */}
      <div className="mb-8">
        <FavoritesList tweets={tweets.posts} />
      </div>

      {/* All Tweets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        { tweets.posts.map((tweet) => (
          <Link key={tweet.id} href={`/tweet/${tweet.id}`}>
            <TweetCard tweet={tweet} />
          </Link>
        ))}
      </div>
    </main>
  );
}
