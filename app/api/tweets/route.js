export async function GET() {
  const tweets = [
    { id: 1, user: "JohnDoe", content: "Hello Next.js!", timestamp: "2m ago" },
    { id: 2, user: "JaneDoe", content: "Loving React & Next.js!", timestamp: "10m ago" }
  ];
  return new Response(JSON.stringify(tweets), { status: 200 });
}