import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { PostFlags } from "../components/PostFlags";
import { useApps } from "../hooks/useApps";
import { usePosts } from "../hooks/usePosts";
import { logger } from "../lib/logger";
import { appDetailsPath, postEditPath, ROUTES } from "../lib/routes";

function toDeleteErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "This post could not be deleted. Please try again.";
}

// S-006: Post Details with F-003 Edit and F-004 Delete.
export function PostDetailsPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { getApp } = useApps();
  const { getPost, deletePost, status, error, reload } = usePosts();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const post = postId ? getPost(postId) : undefined;

  async function handleDelete(): Promise<void> {
    if (!postId) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deletePost(postId);
      logger.debug("Deleted post", { id: postId });
      navigate(ROUTES.timeline);
    } catch (caught) {
      logger.error("Post could not be deleted", caught);
      setDeleteError(toDeleteErrorMessage(caught));
    } finally {
      setIsDeleting(false);
    }
  }

  if (status === "loading") {
    return (
      <section className="page">
        <PageHeader title="Post" description="Loading this social media post." />
        <LoadingState message="Loading post…" />
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="page">
        <PageHeader title="Post" description="This social media post could not be loaded." />
        <ErrorState
          message={error ?? "Posts could not be loaded. Please try again."}
          onRetry={() => {
            void reload();
          }}
        />
      </section>
    );
  }

  if (!post) {
    return (
      <section className="page page--status">
        <PageHeader
          title="Post not found"
          description="This post cannot be opened because it was not found."
        />
        <Link className="button" to={ROUTES.timeline}>
          Back to Timeline
        </Link>
      </section>
    );
  }

  const appName = getApp(post.appId)?.name ?? "Unknown app";

  return (
    <section className="page">
      <PageHeader
        title={post.title}
        description="Planned social media post."
        action={
          <Link className="button" to={ROUTES.postsNew}>
            + Add Post
          </Link>
        }
      />

      <article className="post-details">
        <dl className="post-details__fields">
          <div>
            <dt>App</dt>
            <dd>
              {post.appId ? (
                <Link to={appDetailsPath(post.appId)}>{appName}</Link>
              ) : (
                appName
              )}
            </dd>
          </div>
          <div>
            <dt>Due date</dt>
            <dd>{post.dueDate}</dd>
          </div>
        </dl>

        <PostFlags platform={post.platform} status={post.status} priority={post.priority} />

        <section className="post-details__section">
          <h2>Notes</h2>
          <p>{post.notes ? post.notes : "No notes"}</p>
        </section>

        <section className="post-details__section">
          <h2>Post content</h2>
          <p className="post-details__content">
            {post.content ? post.content : "No post content yet"}
          </p>
        </section>

        {isConfirmingDelete ? (
          <ConfirmDialog
            title="Delete this post?"
            message="This post will be removed from the calendar."
            confirmLabel="Delete Post"
            cancelLabel="Keep Post"
            error={deleteError}
            isBusy={isDeleting}
            onConfirm={() => {
              void handleDelete();
            }}
            onCancel={() => {
              setIsConfirmingDelete(false);
              setDeleteError(null);
            }}
          />
        ) : (
          <div className="post-details__actions">
            <Link className="button" to={postEditPath(post.id)}>
              Edit
            </Link>
            <button
              className="button button--danger"
              type="button"
              onClick={() => {
                logger.debug("Asked to confirm deleting a post", { id: post.id });
                setIsConfirmingDelete(true);
              }}
            >
              Delete
            </button>
          </div>
        )}
      </article>
    </section>
  );
}
