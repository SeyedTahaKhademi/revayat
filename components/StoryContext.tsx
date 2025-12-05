// تمامی حقوق این فایل متعلق به تیم شهید بابایی است.
"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface StoryReply {
  id: string;
  fromId: string;
  fromName: string;
  message: string;
  createdAt: string;
}

export interface Story {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  media: string;
  caption?: string;
  createdAt: string;
  likes: string[];
  replies: StoryReply[];
}

interface AddStoryPayload {
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  media: string;
  caption?: string;
}

interface StoryContextValue {
  stories: Story[];
  addStory: (payload: AddStoryPayload) => { success: boolean; message?: string };
  toggleStoryLike: (storyId: string, userId: string) => {
    success: boolean;
    liked?: boolean;
    message?: string;
  };
  sendStoryReply: (
    storyId: string,
    payload: { userId: string; userName: string; message: string }
  ) => { success: boolean; message?: string };
  updateStory: (
    storyId: string,
    payload: { userId: string; media?: string; caption?: string }
  ) => { success: boolean; message?: string };
  deleteStory: (storyId: string, userId: string) => { success: boolean; message?: string };
}

const STORAGE_KEY = "revayat.stories.v1";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const isFresh = (story: Story) => {
  const created = new Date(story.createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created < TTL_MS;
};

const pruneStories = (items: Story[]) => items.filter(isFresh);

const readStories = (): Story[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Story[];
    if (!Array.isArray(parsed)) return [];
    return pruneStories(parsed);
  } catch {
    return [];
  }
};

const persistStoriesLocally = (stories: Story[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(pruneStories(stories))
    );
  } catch {
    /* no-op */
  }
};

const StoryContext = createContext<StoryContextValue | undefined>(undefined);

export const StoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [stories, setStories] = useState<Story[]>(() => readStories());

  useEffect(() => {
    setStories((prev) => pruneStories(prev));
  }, []);

  useEffect(() => {
    persistStoriesLocally(stories);
  }, [stories]);


  const addStory = useCallback(
    ({
      authorId,
      authorName,
      authorAvatar,
      media,
      caption,
    }: AddStoryPayload) => {
      if (!authorId) {
        return { success: false, message: "ابتدا وارد حساب شوید." };
      }
      if (!media) {
        return { success: false, message: "مدیا برای استوری انتخاب نشده است." };
      }
      const story: Story = {
        id: `story-${Date.now().toString(36)}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        authorId,
        authorName,
        authorAvatar,
        media,
        caption,
        createdAt: new Date().toISOString(),
        likes: [],
        replies: [],
      };
      setStories((prev) => pruneStories([story, ...prev]));
      return { success: true };
    },
    []
  );

  const toggleStoryLike = useCallback(
    (storyId: string, userId: string) => {
      if (!userId) {
        return { success: false, message: "ابتدا وارد حساب شوید." };
      }
      let liked = false;
      setStories((prev) =>
        prev.map((story) => {
          if (story.id !== storyId) return story;
          const already = story.likes.includes(userId);
          liked = !already;
          const likes = already
            ? story.likes.filter((id) => id !== userId)
            : [...story.likes, userId];
          return { ...story, likes };
        })
      );
      return {
        success: true,
        liked,
        message: liked ? "استوری پسند شد." : "پسند شما حذف شد.",
      };
    },
    []
  );

  const sendStoryReply = useCallback(
    (
      storyId: string,
      { userId, userName, message }: { userId: string; userName: string; message: string }
    ) => {
      if (!userId) {
        return { success: false, message: "ابتدا وارد حساب شوید." };
      }
      const trimmed = message.trim();
      if (!trimmed) {
        return { success: false, message: "متن پیام خالی است." };
      }
      const reply: StoryReply = {
        id: `reply-${Date.now().toString(36)}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        fromId: userId,
        fromName: userName,
        message: trimmed,
        createdAt: new Date().toISOString(),
      };
      setStories((prev) =>
        prev.map((story) =>
          story.id === storyId
            ? { ...story, replies: [...story.replies, reply] }
            : story
        )
      );
      return { success: true, message: "پیام ارسال شد." };
    },
    []
  );

  const updateStory = useCallback(
    (
      storyId: string,
      { userId, media, caption }: { userId: string; media?: string; caption?: string }
    ) => {
      const target = stories.find((story) => story.id === storyId);
      if (!target) return { success: false, message: "استوری پیدا نشد." };
      if (target.authorId !== userId) {
        return { success: false, message: "فقط صاحب استوری می‌تواند ویرایش کند." };
      }
      setStories((prev) =>
        prev.map((story) =>
          story.id === storyId
            ? {
                ...story,
                caption: caption !== undefined ? caption : story.caption,
                media: media || story.media,
              }
            : story
        )
      );
      return { success: true, message: "استوری ویرایش شد." };
    },
    [stories]
  );

  const deleteStory = useCallback(
    (storyId: string, userId: string) => {
      const target = stories.find((story) => story.id === storyId);
      if (!target) return { success: false, message: "استوری پیدا نشد." };
      if (target.authorId !== userId) {
        return { success: false, message: "فقط صاحب استوری می‌تواند حذف کند." };
      }
      setStories((prev) => prev.filter((story) => story.id !== storyId));
      return { success: true, message: "استوری حذف شد." };
    },
    [stories]
  );

  const value = useMemo(
    () => ({
      stories,
      addStory,
      toggleStoryLike,
      sendStoryReply,
      updateStory,
      deleteStory,
    }),
    [stories, addStory, toggleStoryLike, sendStoryReply, updateStory, deleteStory]
  );

  return <StoryContext.Provider value={value}>{children}</StoryContext.Provider>;
};

export const useStories = () => {
  const ctx = useContext(StoryContext);
  if (!ctx) throw new Error("useStories must be used within StoryProvider");
  return ctx;
};
