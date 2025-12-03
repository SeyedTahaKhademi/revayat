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

type SaveMap = Record<string, string[]>;

type ToggleSaveResult = {
  success: boolean;
  message?: string;
  saved?: boolean;
};

interface SaveContextValue {
  savedPostIds: string[];
  isSaved: (postId: string) => boolean;
  toggleSave: (postId: string) => ToggleSaveResult;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const STORAGE_KEY = "revayat.saved.content.v1";

const readMap = (): SaveMap => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as SaveMap;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
};

const SaveContext = createContext<SaveContextValue | undefined>(undefined);

export const SaveProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser } = useAuth();
  const [saveMap, setSaveMap] = useState<SaveMap>(() => readMap());
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saveMap));
    } catch {
      /* no-op */
    }
  }, [saveMap]);

  const savedPostIds = useMemo(
    () =>
      currentUser ? saveMap[currentUser.id] || [] : [],
    [saveMap, currentUser]
  );

  const isSaved = useCallback(
    (postId: string) => savedPostIds.includes(postId),
    [savedPostIds]
  );

  const toggleSave = useCallback(
    (postId: string): ToggleSaveResult => {
      const userId = currentUser?.id;
      if (!userId) {
        setIsModalOpen(true);
        return {
          success: false,
          message: "برای ذخیره محتوا ابتدا وارد حساب شوید.",
        };
      }
      let savedNow = false;
      setSaveMap((prev) => {
        const userSaves = prev[userId] || [];
        const already = userSaves.includes(postId);
        savedNow = !already;
        const nextUserSaves = already
          ? userSaves.filter((id) => id !== postId)
          : [...userSaves, postId];
        return {
          ...prev,
          [userId]: nextUserSaves,
        };
      });
      return {
        success: true,
        saved: savedNow,
        message: savedNow ? "به ذخیره‌ها اضافه شد." : "از ذخیره‌ها حذف شد.",
      };
    },
    [currentUser]
  );

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const value = useMemo(
    () => ({
      savedPostIds,
      isSaved,
      toggleSave,
      isModalOpen,
      openModal,
      closeModal,
    }),
    [savedPostIds, isSaved, toggleSave, isModalOpen, openModal, closeModal]
  );

  return <SaveContext.Provider value={value}>{children}</SaveContext.Provider>;
};

export const useSave = () => {
  const ctx = useContext(SaveContext);
  if (!ctx) throw new Error("useSave must be used within SaveProvider");
  return ctx;
};
