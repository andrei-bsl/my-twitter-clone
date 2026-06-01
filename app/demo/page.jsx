export const dynamic = "force-dynamic";

export default async function DemoPage() {

 const res = await fetch("https://localhost:3000/api/demo");

  return (
    <div>
        <h1>Demo Page</h1>
    </div>
  );
}
