import { belongsToCurrentUser, requireCurrentUserId } from "../lib/ownedRecords";
import { TEST_USER } from "../types/auth";
import { applyPostUpdate, createPostRecord } from "./postsService";
import type { PostFormValues, PostRecord, PostsRepository } from "../types/postRecord";

// In-memory store used only by tests. The real app saves posts to Supabase.
export function createMemoryPostsRepository(
  initialPosts: PostRecord[] = [],
  getUserId: () => string | null = () => TEST_USER.id,
): PostsRepository {
  const posts = [...initialPosts];

  function ownedPosts(): PostRecord[] {
    const userId = getUserId();
    return posts.filter((post) => belongsToCurrentUser(post.userId, userId));
  }

  return {
    async listPosts(): Promise<PostRecord[]> {
      return ownedPosts();
    },

    async createPost(values: PostFormValues): Promise<PostRecord> {
      const userId = requireCurrentUserId(getUserId());
      const post = { ...createPostRecord(values), userId };
      posts.push(post);
      return post;
    },

    async updatePost(id: string, values: PostFormValues): Promise<PostRecord> {
      const userId = requireCurrentUserId(getUserId());
      const index = posts.findIndex(
        (post) => post.id === id && belongsToCurrentUser(post.userId, userId),
      );

      if (index < 0) {
        throw new Error("This post could not be saved because it was not found.");
      }

      const updated = { ...applyPostUpdate(posts[index], values), userId: posts[index].userId };
      posts[index] = updated;
      return updated;
    },

    async deletePost(id: string): Promise<void> {
      const userId = requireCurrentUserId(getUserId());
      const index = posts.findIndex(
        (post) => post.id === id && belongsToCurrentUser(post.userId, userId),
      );

      if (index < 0) {
        throw new Error("This post could not be deleted because it was not found.");
      }

      posts.splice(index, 1);
    },
  };
}
