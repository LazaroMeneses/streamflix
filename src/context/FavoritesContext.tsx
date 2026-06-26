import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

interface FavoritesContextType {
  favorites: number[];
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem("streamflix_favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const firestoreReady = useRef(false);

  useEffect(() => {
    firestoreReady.current = false;
    if (user) {
      getDoc(doc(db, "users", user.uid)).then((snap) => {
        if (snap.exists() && Array.isArray(snap.data().favorites)) {
          const remote: number[] = snap.data().favorites;
          setFavorites(remote);
          localStorage.setItem("streamflix_favorites", JSON.stringify(remote));
        }
        firestoreReady.current = true;
      }).catch(() => { firestoreReady.current = true; });
    } else {
      const saved = localStorage.getItem("streamflix_favorites");
      setFavorites(saved ? JSON.parse(saved) : []);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("streamflix_favorites", JSON.stringify(favorites));
    if (user && firestoreReady.current) {
      setDoc(doc(db, "users", user.uid), { favorites }, { merge: true });
    }
  }, [favorites, user]);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const isFavorite = (id: number) => favorites.includes(id);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
