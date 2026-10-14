import { logger } from "../lib/logger";
import { requireSupabaseClient } from "../lib/supabaseClient";
import { requireSignedInUserId } from "./authService";
import { mapPostRow, toPostInsert, toPostUpdate } from "./postsService";
import type { PostFormValues, PostRecord, PostsRepository } from "../types/postRecord";

const POST_COLUMNS =
  "id, title, app_id, platform, due_date, status, priority, notes, content, created_at, updated_at, user_id";

function loadFailedError(): Error {
  return new Error("Posts could not be loaded. Please try again.");
}

function saveFailedError(): Error {
  return new Error("This post could not be saved. Please try again.");
}

function notFoundError(): Error {
  return new Error("This post could not be saved because it was not found.");
}

function deleteFailedError(): Error {
  return new Error("This post could not be deleted. Please try again.");
}

function deleteNotFoundError(): Error {
  return new Error("This post could not be deleted because it was not found.");
}

// Saves and loads D-002 Social Media Post records from Supabase.
export const supabasePostsRepository: PostsRepository = {
  async listPosts(): Promise<PostRecord[]> {
    const client = requireSupabaseClient();
    logger.debug("Loading posts from storage");

    const { data, error } = await client
      .from("posts")
      .select(POST_COLUMNS)
      .order("due_date", { ascending: true });

    if (error) {
      logger.error("Failed to load posts", error);
      throw loadFailedError();
    }

    return (data ?? []).map(mapPostRow);
  },

  async createPost(values: PostFormValues): Promise<PostRecord> {
    const client = requireSupabaseClient();
    const userId = await requireSignedInUserId();
    logger.debug("Creating post in storage", { title: values.title.trim() });

    const { data, error } = await client
      .from("posts")
      .insert(toPostInsert(values, userId))
      .select(POST_COLUMNS)
      .single();

    if (error || !data) {
      logger.error("Failed to create post", error);
      throw saveFailedError();
    }

    return mapPostRow(data);
  },

  async updatePost(id: string, values: PostFormValues): Promise<PostRecord> {
    const client = requireSupabaseClient();
    logger.debug("Updating post in storage", { id, title: values.title.trim() });

    const { data, error } = await client
      .from("posts")
      .update(toPostUpdate(values))
      .eq("id", id)
      .select(POST_COLUMNS)
      .maybeSingle();

    if (error) {
      logger.error("Failed to update post", error);
      throw saveFailedError();
    }

    if (!data) {
      logger.error("Post could not be updated because it was not found", { id });
      throw notFoundError();
    }

    return mapPostRow(data);
  },

  async deletePost(id: string): Promise<void> {
    const client = requireSupabaseClient();
    logger.debug("Deleting post from storage", { id });

    const { data, error } = await client
      .from("posts")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      logger.error("Failed to delete post", error);
      throw deleteFailedError();
    }

    if (!data) {
      logger.error("Post could not be deleted because it was not found", { id });
      throw deleteNotFoundError();
    }
  },
};
