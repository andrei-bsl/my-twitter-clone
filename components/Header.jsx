import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-blue-500 text-white py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-6">
        <h1 className="text-2xl font-bold">
          <Link href="/" className="hover:text-gray-200 transition">
            Twitter Clone
          </Link>
        </h1>
        <nav className="flex space-x-4">
          <Link href="/" className="hover:text-gray-200 transition">
            Home
          </Link>
          <Link href="/tweet" className="hover:text-gray-200 transition">
            Tweets
          </Link>
        </nav>
      </div>
    </header>
  );
}
