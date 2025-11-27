"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useFavorites } from "@/context/FavoritesContext";

export default function Header() {
  const { data: session, status } = useSession();
  const { favoriteTweetIds } = useFavorites();
  const loading = status === "loading";

  return (
    <header className="bg-blue-500 text-white py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-6">
        <h1 className="text-2xl font-bold">
          <Link href="/" className="hover:text-gray-200 transition">
            🐦 Twitter Clone
          </Link>
        </h1>
        <nav className="flex items-center space-x-4">
          <Link href="/" className="hover:text-gray-200 transition">
            Home
          </Link>
          
          {session && (
            <>
              <Link 
                href="/favorites" 
                className="hover:text-gray-200 transition flex items-center gap-2"
              >
                Favorites
                {favoriteTweetIds.length > 0 && (
                  <span className="bg-yellow-500 text-white text-xs rounded-full px-2 py-1">
                    {favoriteTweetIds.length}
                  </span>
                )}
              </Link>
            </>
          )}

          {loading ? (
            <span className="text-sm">Loading...</span>
          ) : session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm">
                Hi, <span className="font-semibold">{session.user.name}</span>
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition text-sm font-semibold"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition text-sm font-semibold"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
