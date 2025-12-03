"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

type FollowMap = Record<string, string[]>;

type ToggleFollowResult = {
  success: boolean;
  message?: string;
  following?: boolean;
};

interface FollowContextValue {
  followingIds: string[];
  isFollowing: (userId: string) => boolean;
  toggleFollow: (targetUserId: string) => ToggleFollowResult;
  getFollowers: (userId: string) => string[];
  getFollowing: (userId: string) => string[];
}

const STORAGE_KEY = "revayat.follow.map.v1";

const readMap = (): FollowMap => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as FollowMap;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
};

const FollowContext = createContext<FollowContextValue | undefined>(undefined);

export const FollowProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser } = useAuth();
  const [followMap, setFollowMap] = useState<FollowMap>(() => readMap());

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(followMap));
    } catch {
      /* no-op */
    }
  }, [followMap]);

  const followingIds = useMemo(
    () => (currentUser ? followMap[currentUser.id] || [] : []),
    [followMap, currentUser]
  );

  const isFollowing = useCallback(
    (userId: string) => followingIds.includes(userId),
    [followingIds]
  );

  const toggleFollow = useCallback(
    (targetUserId: string): ToggleFollowResult => {
      const userId = currentUser?.id;
      if (!userId) {
        return { success: false, message: "برای دنبال کردن ابتدا وارد شوید." };
      }
      if (targetUserId === userId) {
        return { success: false, message: "نمی‌توانید خودتان را دنبال کنید." };
      }
      let followingNow = false;
      setFollowMap((prev) => {
        const current = prev[userId] || [];
        const already = current.includes(targetUserId);
        followingNow = !already;
        const next = already
          ? current.filter((id) => id !== targetUserId)
          : [...current, targetUserId];
        return { ...prev, [userId]: next };
      });
      return {
        success: true,
        following: followingNow,
        message: followingNow ? "به دنبال‌شونده‌ها اضافه شد." : "از دنبال‌شونده‌ها حذف شد.",
      };
    },
    [currentUser]
  );

  const getFollowers = useCallback(
    (userId: string) =>
      Object.entries(followMap)
        .filter(([, following]) => following.includes(userId))
        .map(([uid]) => uid),
    [followMap]
  );

  const getFollowing = useCallback(
    (userId: string) => followMap[userId] || [],
    [followMap]
  );

  const value = useMemo(
    () => ({
      followingIds,
      isFollowing,
      toggleFollow,
      getFollowers,
      getFollowing,
    }),
    [followingIds, isFollowing, toggleFollow, getFollowers, getFollowing]
  );

  return <FollowContext.Provider value={value}>{children}</FollowContext.Provider>;
};

export const useFollow = () => {
  const ctx = useContext(FollowContext);
  if (!ctx) throw new Error("useFollow must be used within FollowProvider");
  return ctx;
};
