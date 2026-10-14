import type { PostPlatform, PostPriority, PostStatus } from "../types/postRecord";

type PostFlagsProps = {
  platform: PostPlatform;
  status: PostStatus;
  priority: PostPriority;
};

function flagClassName(kind: "platform" | "status" | "priority", value: string): string {
  const slug = value.toLowerCase().replace(/\s+/g, "-");
  return `post-flag post-flag--${kind} post-flag--${slug}`;
}

// Shows platform, status, and priority with text labels, not colour alone.
export function PostFlags({ platform, status, priority }: PostFlagsProps) {
  return (
    <dl className="post-flags">
      <div className={flagClassName("platform", platform)}>
        <dt>Platform</dt>
        <dd>{platform}</dd>
      </div>
      <div className={flagClassName("status", status)}>
        <dt>Status</dt>
        <dd>{status}</dd>
      </div>
      <div className={flagClassName("priority", priority)}>
        <dt>Priority</dt>
        <dd>{priority}</dd>
      </div>
    </dl>
  );
}
