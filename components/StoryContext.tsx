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
}

const STORAGE_KEY = "revayat.stories.v1";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const API_BASE_URL =
  process.env.NEXT_PUBLIC_REVAYAT_API_BASE_URL?.replace(/\/+$/, "") ?? undefined;

const buildApiUrl = (path: string) => {
  if (!API_BASE_URL) return "";
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

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

const fetchRemoteStories = async (): Promise<Story[] | null> => {
  if (!API_BASE_URL) return null;
  try {
    const response = await fetch(buildApiUrl("/stories-read.php"), {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Unable to read stories");
    const payload = await response.json();
    if (!Array.isArray(payload)) return [];
    return pruneStories(
      payload.map((item) => ({
        ...item,
        likes: Array.isArray(item.likes)
          ? item.likes.filter((id: unknown): id is string => typeof id === "string")
          : [],
        replies: Array.isArray(item.replies)
          ? item.replies
              .filter(
                (reply: any) =>
                  reply &&
                  typeof reply.id === "string" &&
                  typeof reply.fromId === "string" &&
                  typeof reply.fromName === "string" &&
                  typeof reply.message === "string"
              )
              .map((reply: any) => ({
                ...reply,
                createdAt: reply.createdAt || new Date().toISOString(),
              }))
          : [],
        createdAt: item.createdAt || new Date().toISOString(),
      }))
    );
  } catch (error) {
    console.error("Unable to read remote stories.", error);
    return null;
  }
};

const persistRemoteStories = async (stories: Story[]) => {
  if (!API_BASE_URL) return;
  try {
    await fetch(buildApiUrl("/stories-store.php"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pruneStories(stories)),
    });
  } catch (error) {
    console.error("Unable to persist stories remotely.", error);
  }
};

const uploadImageToHost = async (
  media: string,
  reference: string
): Promise<string | null> => {
  if (!API_BASE_URL) return null;
  if (!media.startsWith("data:")) return null;
  try {
    const response = await fetch(buildApiUrl("/upload-image.php"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: media,
        reference,
      }),
    });
    if (!response.ok) throw new Error("Upload failed");
    const payload = (await response.json()) as { url?: string };
    return typeof payload?.url === "string" ? payload.url : null;
  } catch (error) {
    console.error("Unable to upload story media.", error);
    return null;
  }
};

const StoryContext = createContext<StoryContextValue | undefined>(undefined);

export const StoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [stories, setStories] = useState<Story[]>(() => readStories());
  const [remoteReady, setRemoteReady] = useState<boolean>(() => !API_BASE_URL);

  useEffect(() => {
    setStories((prev) => pruneStories(prev));
  }, []);

  useEffect(() => {
    persistStoriesLocally(stories);
  }, [stories]);

  useEffect(() => {
    if (!API_BASE_URL) return;
    let cancelled = false;
    const load = async () => {
      try {
        const remoteStories = await fetchRemoteStories();
        if (!cancelled && remoteStories) {
          setStories(pruneStories(remoteStories));
        }
      } finally {
        if (!cancelled) {
          setRemoteReady(true);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!API_BASE_URL || !remoteReady) return;
    persistRemoteStories(stories);
  }, [stories, remoteReady]);

  useEffect(() => {
    if (!API_BASE_URL) return;
    let cancelled = false;
    const pending = stories.filter((story) => story.media.startsWith("data:"));
    if (!pending.length) return;
    const process = async () => {
      for (const story of pending) {
        const uploaded = await uploadImageToHost(story.media, story.id);
        if (!cancelled && uploaded) {
          setStories((prev) =>
            prev.map((item) =>
              item.id === story.id ? { ...item, media: uploaded } : item
            )
          );
        }
      }
    };
    process();
    return () => {
      cancelled = true;
    };
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

  const value = useMemo(
    () => ({
      stories,
      addStory,
      toggleStoryLike,
      sendStoryReply,
    }),
    [stories, addStory, toggleStoryLike, sendStoryReply]
  );

  return <StoryContext.Provider value={value}>{children}</StoryContext.Provider>;
};

export const useStories = () => {
  const ctx = useContext(StoryContext);
  if (!ctx) throw new Error("useStories must be used within StoryProvider");
  return ctx;
};
