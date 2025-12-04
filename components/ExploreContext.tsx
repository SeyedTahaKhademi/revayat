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

type UpdatePostPayload = {
  postId: string;
  authorId: string;
  caption: string;
  image?: string;
};

type DeletePostPayload = {
  postId: string;
  authorId: string;
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
  updatePost: (payload: UpdatePostPayload) => { success: boolean; message?: string };
  deletePost: (payload: DeletePostPayload) => { success: boolean; message?: string };
};

const STORAGE_KEY = "revayat.explore.posts.v2";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_REVAYAT_API_BASE_URL?.replace(/\/+$/, "") ?? undefined;

const buildApiUrl = (path: string) => {
  if (!API_BASE_URL) return "";
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const USER_ORIGIN: ExplorePost["origin"] = "user";

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

const mergeWithSeed = (items: ExplorePost[]): ExplorePost[] => {
  const seed = buildSeedPosts();
  const merged = [...items];
  seed.forEach((seedPost) => {
    if (!merged.some((post) => post.id === seedPost.id)) {
      merged.push(seedPost);
    }
  });
  return merged;
};

const readPersistedPosts = (): ExplorePost[] => {
  if (typeof window === "undefined") return buildSeedPosts();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildSeedPosts();
    const parsed = JSON.parse(raw) as ExplorePost[];
    if (!Array.isArray(parsed)) return buildSeedPosts();
    return mergeWithSeed(parsed);
  } catch {
    return buildSeedPosts();
  }
};

const persistPosts = (posts: ExplorePost[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(posts.filter((post) => post.origin === USER_ORIGIN))
    );
  } catch {
    /* no-op */
  }
};

const normalizeComments = (data: unknown): ExploreComment[] => {
  if (!Array.isArray(data)) return [];
  return (data as ExploreComment[])
    .filter(
      (comment) =>
        comment &&
        typeof comment.id === "string" &&
        typeof comment.userId === "string" &&
        typeof comment.authorName === "string" &&
        typeof comment.body === "string"
    )
    .map((comment) => ({
      ...comment,
      createdAt: comment.createdAt || new Date().toISOString(),
    }));
};

const normalizePosts = (data: unknown): ExplorePost[] => {
  if (!Array.isArray(data)) return [];
  return (data as ExplorePost[])
    .filter(
      (post) =>
        post &&
        typeof post.id === "string" &&
        typeof post.authorId === "string" &&
        typeof post.authorName === "string" &&
        typeof post.caption === "string" &&
        typeof post.image === "string"
    )
    .map((post) => ({
      ...post,
      likes: Array.isArray(post.likes)
        ? post.likes.filter((id): id is string => typeof id === "string")
        : [],
      comments: normalizeComments(post.comments),
      origin: USER_ORIGIN,
      createdAt: post.createdAt || new Date().toISOString(),
    }));
};

const fetchRemotePosts = async (): Promise<ExplorePost[] | null> => {
  if (!API_BASE_URL) return null;
  try {
    const response = await fetch(buildApiUrl("/explore-read.php"), {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Failed to read explore posts.");
    }
    const payload = await response.json();
    return mergeWithSeed(normalizePosts(payload));
  } catch (error) {
    console.error("Unable to fetch explore posts from remote storage.", error);
    return null;
  }
};

const persistRemotePosts = async (posts: ExplorePost[]) => {
  if (!API_BASE_URL) return;
  try {
    await fetch(buildApiUrl("/explore-store.php"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        posts.filter((post) => post.origin === USER_ORIGIN)
      ),
    });
  } catch (error) {
    console.error("Unable to persist explore posts remotely.", error);
  }
};

const uploadImageToHost = async (
  image: string,
  idHint: string
): Promise<string | null> => {
  if (!API_BASE_URL) return null;
  if (!image.startsWith("data:")) return null;
  try {
    const response = await fetch(buildApiUrl("/upload-image.php"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: image,
        reference: idHint,
      }),
    });
    if (!response.ok) {
      throw new Error("Upload failed.");
    }
    const payload = (await response.json()) as { url?: string };
    return typeof payload?.url === "string" ? payload.url : null;
  } catch (error) {
    console.error("Unable to upload image to host.", error);
    return null;
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
  const [remoteReady, setRemoteReady] = useState<boolean>(() => !API_BASE_URL);

  useEffect(() => {
    persistPosts(posts);
  }, [posts]);

  useEffect(() => {
    if (!API_BASE_URL) return;
    let cancelled = false;
    const load = async () => {
      try {
        const remotePosts = await fetchRemotePosts();
        if (!cancelled && remotePosts) {
          setPosts(remotePosts);
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
    persistRemotePosts(posts);
  }, [posts, remoteReady]);

  useEffect(() => {
    if (!API_BASE_URL) return;
    let cancelled = false;
    const pending = posts.filter(
      (post) => post.origin === USER_ORIGIN && post.image.startsWith("data:")
    );
    if (!pending.length) return;

    const process = async () => {
      for (const post of pending) {
        const url = await uploadImageToHost(post.image, post.id);
        if (!cancelled && url) {
          setPosts((prev) =>
            prev.map((item) =>
              item.id === post.id ? { ...item, image: url } : item
            )
          );
        }
      }
    };
    process();

    return () => {
      cancelled = true;
    };
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
        origin: USER_ORIGIN,
      };
      setPosts((prev) => [post, ...prev]);
      return { success: true };
    },
    []
  );

  const updatePost = useCallback(
    ({ postId, authorId, caption, image }: UpdatePostPayload) => {
      const trimmed = caption.trim();
      if (!trimmed) {
        return { success: false, message: "کپشن را بنویسید." };
      }
      let result: { success: boolean; message?: string } = {
        success: false,
        message: "پست پیدا نشد.",
      };
      setPosts((prev) => {
        const target = prev.find((post) => post.id === postId);
        if (!target) {
          result = { success: false, message: "پست موردنظر پیدا نشد." };
          return prev;
        }
        if (target.authorId !== authorId) {
          result = { success: false, message: "فقط نویسنده می‌تواند ویرایش کند." };
          return prev;
        }
        result = { success: true };
        return prev.map((post) =>
          post.id === postId ? { ...post, caption: trimmed, image: image || post.image } : post
        );
      });
      return result;
    },
    []
  );

  const deletePost = useCallback(
    ({ postId, authorId }: DeletePostPayload) => {
      let result: { success: boolean; message?: string } = {
        success: false,
        message: "پست پیدا نشد.",
      };
      setPosts((prev) => {
        const target = prev.find((post) => post.id === postId);
        if (!target) {
          result = { success: false, message: "پست موردنظر پیدا نشد." };
          return prev;
        }
        if (target.authorId !== authorId) {
          result = { success: false, message: "فقط نویسنده می‌تواند حذف کند." };
          return prev;
        }
        result = { success: true };
        return prev.filter((post) => post.id !== postId);
      });
      return result;
    },
    []
  );

  const value = useMemo<ExploreContextValue>(
    () => ({
      posts,
      addComment,
      toggleLike,
      createPost,
      updatePost,
      deletePost,
    }),
    [posts, addComment, toggleLike, createPost, updatePost, deletePost]
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
