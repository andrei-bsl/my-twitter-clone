import { getToken } from "next-auth/jwt";
import { isDatabaseEnabled, makeSureDbIsReady } from "@/lib/db";
import { Tweet } from "@/models/Tweet";

function getLocalTweetStore() {
  if (!globalThis.localMyTweetsStore) {
    globalThis.localMyTweetsStore = [];
  }

  return globalThis.localMyTweetsStore;
}

async function getAuthorId(request) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return null;
  }

  return token.id ?? token.sub ?? token.username ?? token.email ?? null;
}

function mapTweet(tweet) {
  return {
    id: tweet._id?.toString?.() ?? tweet.id,
    title: tweet.title,
    body: tweet.body,
    tags: Array.isArray(tweet.tags) ? tweet.tags : [],
    reactions: tweet.reactions ?? { likes: 0, dislikes: 0 },
    views: tweet.views ?? 0,
    userId: tweet.userId,
    authorId: tweet.authorId,
    createdAt: tweet.createdAt,
    updatedAt: tweet.updatedAt,
  };
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
    .filter(Boolean);
}

export async function GET(request) {
  const authorId = await getAuthorId(request);

  if (!authorId) {
    return Response.json(
      { error: "Unauthorized", message: "Please log in to view your tweets" },
      { status: 401 }
    );
  }

  if (isDatabaseEnabled()) {
    try {
      await makeSureDbIsReady();
      const tweets = await Tweet.find({ authorId }).sort({ createdAt: -1 }).lean();

      return Response.json(
        { posts: tweets.map(mapTweet), source: "database" },
        { status: 200 }
      );
    } catch (error) {
      console.warn("⚠️ Failed to load my tweets from database, using memory fallback:", error.message);
    }
  }

  const store = getLocalTweetStore();
  const tweets = store.filter((tweet) => tweet.authorId === authorId);

  return Response.json(
    { posts: tweets.map(mapTweet), source: "memory" },
    { status: 200 }
  );
}

export async function POST(request) {
  const authorId = await getAuthorId(request);

  if (!authorId) {
    return Response.json(
      { error: "Unauthorized", message: "Please log in to create tweets" },
      { status: 401 }
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const body = typeof payload.body === "string" ? payload.body.trim() : "";
  const tags = normalizeTags(payload.tags);

  if (!title || !body) {
    return Response.json(
      { error: "Title and body are required" },
      { status: 400 }
    );
  }

  if (isDatabaseEnabled()) {
    try {
      await makeSureDbIsReady();

      const createdTweet = await Tweet.create({
        title,
        body,
        tags,
        reactions: { likes: 0, dislikes: 0 },
        views: 0,
        userId: authorId,
        authorId,
      });

      return Response.json(
        { tweet: mapTweet(createdTweet.toObject()), source: "database" },
        { status: 201 }
      );
    } catch (error) {
      console.warn("⚠️ Failed to create tweet in database, using memory fallback:", error.message);
    }
  }

  const now = new Date().toISOString();
  const localTweet = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    body,
    tags,
    reactions: { likes: 0, dislikes: 0 },
    views: 0,
    userId: authorId,
    authorId,
    createdAt: now,
    updatedAt: now,
  };

  const store = getLocalTweetStore();
  store.unshift(localTweet);

  return Response.json(
    { tweet: mapTweet(localTweet), source: "memory" },
    { status: 201 }
  );
}
