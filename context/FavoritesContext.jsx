"use client";

import { createContext, useState, useContext, useEffect } from "react";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  // Initialize state with localStorage value
  const [favoriteTweetIds, setFavoriteTweetIds] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("favoriteTweets");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (error) {
          console.error("Failed to load favorites:", error);
        }
      }
    }
    return [];
  });

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("favoriteTweets", JSON.stringify(favoriteTweetIds));
    }
  }, [favoriteTweetIds]);

  const addToFavorites = (tweetId) => {
    setFavoriteTweetIds((prev) => {
      if (prev.includes(tweetId)) return prev;
      return [...prev, tweetId];
    });
  };

  const removeFromFavorites = (tweetId) => {
    setFavoriteTweetIds((prev) => prev.filter((id) => id !== tweetId));
  };

  const toggleFavorite = (tweetId) => {
    setFavoriteTweetIds((prev) =>
      prev.includes(tweetId)
        ? prev.filter((id) => id !== tweetId)
        : [...prev, tweetId]
    );
  };

  const isFavorite = (tweetId) => favoriteTweetIds.includes(tweetId);

  return (
    <FavoritesContext.Provider
      value={{
        favoriteTweetIds,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
