"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { documentItems } from "@/data/documents";

export interface ExploreComment {
  id: string;
  userId: string;
  authorName: string;
  body: string;
  createdAt: string;
  parentId?: string;
}

export interface ExplorePost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  image: string;
  caption: string;
  likes: string[];
  comments: ExploreComment[];
  createdAt: string;
  origin: "seed" | "user";
}

type CommentPayload = {
  postId: string;
  userId: string;
  authorName: string;
  body: string;
  parentId?: string;
};

type LikePayload = {
  postId: string;
  userId: string;
};

type CreatePostPayload = {
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  image: string;
  caption: string;
};

type ExploreContextValue = {
  posts: ExplorePost[];
  addComment: (payload: CommentPayload) => { success: boolean; message?: string };
  toggleLike: (payload: LikePayload) => {
    success: boolean;
    message?: string;
    liked?: boolean;
  };
  createPost: (payload: CreatePostPayload) => { success: boolean; message?: string };
};

const STORAGE_KEY = "revayat.explore.posts.v2";

const buildSeedPosts = (): ExplorePost[] => {
  const galleryItems = documentItems.filter(
    (doc) => doc.category === "گزارش تصویری"
  );
  return galleryItems.map((item, index) => ({
    id: item.slug || `gallery-${index}`,
    authorId: "revayat-seed",
    authorName: "روایت تصویری",
    authorAvatar: undefined,
    image: item.image,
    caption: `قاب منتخب «${item.title}»`,
    likes: [],
    comments: [],
    createdAt: new Date(Date.now() - index * 86400000).toISOString(),
    origin: "seed",
  }));
};

const readPersistedPosts = (): ExplorePost[] => {
  if (typeof window === "undefined") return buildSeedPosts();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildSeedPosts();
    const parsed = JSON.parse(raw) as ExplorePost[];
    if (!Array.isArray(parsed)) return buildSeedPosts();
    const seed = buildSeedPosts();
    const merged = [...parsed];
    seed.forEach((seedPost) => {
      if (!merged.some((post) => post.id === seedPost.id)) {
        merged.push(seedPost);
      }
    });
    return merged;
  } catch {
    return buildSeedPosts();
  }
};

const persistPosts = (posts: ExplorePost[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch {
    /* no-op */
  }
};

const createId = (prefix: string) => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
};

const ExploreContext = createContext<ExploreContextValue | undefined>(undefined);

export const ExploreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [posts, setPosts] = useState<ExplorePost[]>(() => readPersistedPosts());

  useEffect(() => {
    persistPosts(posts);
  }, [posts]);

  const toggleLike = useCallback(
    ({ postId, userId }: LikePayload) => {
      if (!userId) {
        return { success: false, message: "برای پسندیدن باید وارد شوید." };
      }
      let liked = false;
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          const alreadyLiked = post.likes.includes(userId);
          liked = !alreadyLiked;
          const likes = alreadyLiked
            ? post.likes.filter((id) => id !== userId)
            : [...post.likes, userId];
          return { ...post, likes };
        })
      );
      return { success: true, liked };
    },
    []
  );

  const addComment = useCallback(
    ({ postId, userId, authorName, body, parentId }: CommentPayload) => {
      if (!userId) {
        return { success: false, message: "برای ثبت نظر باید وارد شوید." };
      }
      const trimmed = body.trim();
      if (!trimmed) {
        return { success: false, message: "متن نظر خالی است." };
      }
      const comment: ExploreComment = {
        id: createId("comment"),
        userId,
        authorName,
        body: trimmed,
        createdAt: new Date().toISOString(),
        parentId,
      };
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, comments: [...post.comments, comment] }
            : post
        )
      );
      return { success: true };
    },
    []
  );

  const createPost = useCallback(
    ({ authorId, authorName, authorAvatar, image, caption }: CreatePostPayload) => {
      const trimmedCaption = caption.trim();
      if (!authorId) {
        return { success: false, message: "ابتدا وارد حساب شوید." };
      }
      if (!image) {
        return { success: false, message: "عکس انتخاب نشده است." };
      }
      if (!trimmedCaption) {
        return { success: false, message: "کپشن را بنویسید." };
      }
      const post: ExplorePost = {
        id: createId("post"),
        authorId,
        authorName,
        authorAvatar,
        image,
        caption: trimmedCaption,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
        origin: "user",
      };
      setPosts((prev) => [post, ...prev]);
      return { success: true };
    },
    []
  );

  const value = useMemo<ExploreContextValue>(
    () => ({
      posts,
      addComment,
      toggleLike,
      createPost,
    }),
    [posts, addComment, toggleLike, createPost]
  );

  return (
    <ExploreContext.Provider value={value}>{children}</ExploreContext.Provider>
  );
};

export const useExplore = () => {
  const ctx = useContext(ExploreContext);
  if (!ctx) {
    throw new Error("useExplore must be used within ExploreProvider");
  }
  return ctx;
};
