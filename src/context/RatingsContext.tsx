import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

interface RatingsContextType {
  ratings: Record<number, number>;
  rateMovie: (id: number, rating: number) => void;
  getUserRating: (id: number) => number | null;
  getAverageRating: (id: number, baseRating: number) => number;
}

const RatingsContext = createContext<RatingsContextType | undefined>(undefined);

export function RatingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Record<number, number>>(() => {
    const saved = localStorage.getItem("streamflix_ratings");
    return saved ? JSON.parse(saved) : {};
  });
  const firestoreReady = useRef(false);

  useEffect(() => {
    firestoreReady.current = false;
    if (user) {
      getDoc(doc(db, "users", user.uid)).then((snap) => {
        if (snap.exists() && snap.data().ratings) {
          const remote: Record<number, number> = snap.data().ratings;
          setRatings(remote);
          localStorage.setItem("streamflix_ratings", JSON.stringify(remote));
        }
        firestoreReady.current = true;
      }).catch(() => { firestoreReady.current = true; });
    } else {
      const saved = localStorage.getItem("streamflix_ratings");
      setRatings(saved ? JSON.parse(saved) : {});
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("streamflix_ratings", JSON.stringify(ratings));
    if (user && firestoreReady.current) {
      setDoc(doc(db, "users", user.uid), { ratings }, { merge: true });
    }
  }, [ratings, user]);

  const rateMovie = (id: number, rating: number) => {
    setRatings((prev) => ({ ...prev, [id]: rating }));
  };

  const getUserRating = (id: number): number | null => ratings[id] ?? null;

  const getAverageRating = (id: number, baseRating: number): number => {
    const userRating = ratings[id];
    if (userRating === undefined) return baseRating;
    const userScaled = (userRating / 5) * 10;
    return Math.round(((baseRating + userScaled) / 2) * 10) / 10;
  };

  return (
    <RatingsContext.Provider value={{ ratings, rateMovie, getUserRating, getAverageRating }}>
      {children}
    </RatingsContext.Provider>
  );
}

export function useRatings() {
  const context = useContext(RatingsContext);
  if (context === undefined) {
    throw new Error("useRatings must be used within a RatingsProvider");
  }
  return context;
}
