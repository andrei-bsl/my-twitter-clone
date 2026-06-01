"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function CreateTweetPage() {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [listError, setListError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [myTweets, setMyTweets] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchMyTweets() {
      if (status !== "authenticated") {
        if (isMounted) {
          setLoadingList(false);
          setMyTweets([]);
        }
        return;
      }

      setLoadingList(true);
      setListError("");

      try {
        const response = await fetch("/api/tweets/my-tweets", {
          method: "GET",
          cache: "no-store",
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message || payload?.error || "Failed to load your tweets");
        }

        if (isMounted) {
          setMyTweets(Array.isArray(payload.posts) ? payload.posts : []);
        }
      } catch (error) {
        if (isMounted) {
          setListError(error.message || "Failed to load your tweets");
        }
      } finally {
        if (isMounted) {
          setLoadingList(false);
        }
      }
    }

    fetchMyTweets();

    return () => {
      isMounted = false;
    };
  }, [status]);

  const formatCreatedAt = (value) => {
    if (!value) {
      return "";
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSuccessMessage("");
    setLoadingCreate(true);

    try {
      const response = await fetch("/api/tweets/my-tweets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || "Failed to create tweet");
      }

      if (payload?.tweet) {
        setMyTweets((previousTweets) => [payload.tweet, ...previousTweets]);
      }

      setTitle("");
      setBody("");
      setTags("");
      setSuccessMessage("Tweet posted successfully.");
    } catch (error) {
      setSubmitError(error.message || "An error occurred. Please try again.");
    } finally {
      setLoadingCreate(false);
    }
  };

  if (status === "loading") {
    return (
      <main className="container mx-auto p-6 min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Checking your session...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="container mx-auto p-6 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Login Required
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please log in to create tweets and view your author feed.
          </p>
          <Link href="/login" className="inline-block">
            <Button variant="primary">Go to Login</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-6 min-h-screen">
      <div className="max-w-3xl mx-auto mt-8 space-y-8">
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ✍️ My Tweets
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Logged in as {session.user?.name || session.user?.username || "User"}. Post a new tweet below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={100}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="What's on your mind?"
              />
            </div>

            <div>
              <label
                htmlFor="body"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Content
              </label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                placeholder="Share your thoughts..."
              />
            </div>

            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Tags (comma-separated)
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="coding, nextjs, learning"
              />
            </div>

            {submitError && (
              <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
                {submitError}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 px-4 py-3 rounded">
                {successMessage}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loadingCreate}
                variant="primary"
                className="flex-1 py-3"
              >
                {loadingCreate ? "Posting..." : "Post Tweet"}
              </Button>
              <Link
                href="/"
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-6 rounded-lg text-center transition-colors"
              >
                Back Home
              </Link>
            </div>
          </form>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            My Tweet List
          </h2>

          {loadingList && (
            <p className="text-gray-600 dark:text-gray-300">Loading your tweets...</p>
          )}

          {!loadingList && listError && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
              {listError}
            </div>
          )}

          {!loadingList && !listError && myTweets.length === 0 && (
            <p className="text-gray-600 dark:text-gray-300">
              You have not posted any tweets yet.
            </p>
          )}

          {!loadingList && !listError && myTweets.length > 0 && (
            <div className="space-y-4">
              {myTweets.map((tweet) => (
                <article
                  key={tweet.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-5"
                >
                  <div className="flex justify-between gap-4 items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {tweet.title}
                    </h3>
                    {tweet.createdAt && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatCreatedAt(tweet.createdAt)}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-3">{tweet.body}</p>

                  {Array.isArray(tweet.tags) && tweet.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {tweet.tags.map((tag) => (
                        <span
                          key={`${tweet.id}-${tag}`}
                          className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      👍 {tweet.reactions?.likes || 0} • 👎 {tweet.reactions?.dislikes || 0}
                    </span>
                    <Link href={`/tweet/${tweet.id}`} className="text-blue-500 hover:text-blue-600">
                      Open tweet
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
