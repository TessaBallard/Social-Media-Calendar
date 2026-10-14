import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { logger } from "../lib/logger";
import { supabasePostsRepository } from "../services/postsRepository";
import { sortPostsByDueDate } from "../services/postsService";
import type { PostFormValues, PostRecord, PostsRepository } from "../types/postRecord";

type LoadStatus = "loading" | "ready" | "error";

type PostsContextValue = {
  posts: PostRecord[];
  status: LoadStatus;
  error: string | null;
  getPost: (id: string) => PostRecord | undefined;
  addPost: (values: PostFormValues) => Promise<PostRecord>;
  updatePost: (id: string, values: PostFormValues) => Promise<PostRecord>;
  deletePost: (id: string) => Promise<void>;
  reload: () => Promise<void>;
};

const PostsContext = createContext<PostsContextValue | null>(null);

type PostsProviderProps = {
  children: ReactNode;
  repository?: PostsRepository;
};

function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

const defaultPostsRepository = supabasePostsRepository;

// Loads and updates D-002 Social Media Post records from the online store.
export function PostsProvider({
  children,
  repository = defaultPostsRepository,
}: PostsProviderProps) {
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (): Promise<void> => {
    setStatus("loading");
    setError(null);

    try {
      const records = sortPostsByDueDate(await repository.listPosts());
      logger.debug("Loaded posts", { count: records.length });
      setPosts(records);
      setStatus("ready");
    } catch (loadError) {
      logger.error("Posts could not be loaded", loadError);
      setPosts([]);
      setStatus("error");
      setError(toErrorMessage(loadError, "Posts could not be loaded. Please try again."));
    }
  }, [repository]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addPost = useCallback(
    async (values: PostFormValues): Promise<PostRecord> => {
      const post = await repository.createPost(values);
      logger.debug("Added post", { id: post.id, title: post.title });
      setPosts((current) => sortPostsByDueDate([...current, post]));
      return post;
    },
    [repository],
  );

  const updatePost = useCallback(
    async (id: string, values: PostFormValues): Promise<PostRecord> => {
      const updated = await repository.updatePost(id, values);
      logger.debug("Updated post", { id: updated.id, title: updated.title });
      setPosts((current) =>
        sortPostsByDueDate(current.map((post) => (post.id === id ? updated : post))),
      );
      return updated;
    },
    [repository],
  );

  const deletePost = useCallback(
    async (id: string): Promise<void> => {
      await repository.deletePost(id);
      logger.debug("Removed post", { id });
      setPosts((current) => current.filter((post) => post.id !== id));
    },
    [repository],
  );

  const value = useMemo<PostsContextValue>(() => {
    return {
      posts,
      status,
      error,
      getPost: (id: string) => posts.find((post) => post.id === id),
      addPost,
      updatePost,
      deletePost,
      reload,
    };
  }, [posts, status, error, addPost, updatePost, deletePost, reload]);

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
}

export function usePosts(): PostsContextValue {
  const context = useContext(PostsContext);

  if (!context) {
    throw new Error("usePosts must be used inside PostsProvider.");
  }

  return context;
}
