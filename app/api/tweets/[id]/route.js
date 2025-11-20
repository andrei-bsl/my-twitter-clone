import { makeSureDbIsReady } from "@/lib/db.js";
import { Tweet } from "@/models/Tweet.js";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Try to get tweet from database
    await makeSureDbIsReady();
    const tweet = await Tweet.findById(id);

    if (!tweet) {
      return Response.json({ error: "Tweet not found" }, { status: 404 });
    }

    return Response.json(tweet);
  } catch (error) {
    console.error("Error fetching tweet:", error);

    // If DB fails, try external API as fallback
    try {
      const { id } = await params;
      const response = await fetch(`https://dummyjson.com/posts/${id}`);
      const tweet = await response.json();
      return Response.json(tweet);
    } catch (fallbackError) {
      console.error("External API also failed:", fallbackError);
      return Response.json(
        { error: "Failed to fetch tweet" },
        { status: 500 }
      );
    }
  }
}
