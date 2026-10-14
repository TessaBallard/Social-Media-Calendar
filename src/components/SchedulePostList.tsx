import { Link } from "react-router-dom";
import { postDetailsPath } from "../lib/routes";
import type { PostRecord } from "../types/postRecord";

type SchedulePostListProps = {
  posts: PostRecord[];
  getAppName: (appId: string) => string;
  listLabel: string;
  showOverdueLabel?: boolean;
};

// Compact overdue/upcoming list used on Dashboard, Calendar, and Timeline.
export function SchedulePostList({
  posts,
  getAppName,
  listLabel,
  showOverdueLabel = false,
}: SchedulePostListProps) {
  return (
    <ul className="schedule-list" aria-label={listLabel}>
      {posts.map((post) => (
        <li key={post.id}>
          <Link className="schedule-list__title" to={postDetailsPath(post.id)}>
            {post.title}
          </Link>
          <p className="schedule-list__meta">
            {getAppName(post.appId)} · Due {post.dueDate}
            {showOverdueLabel ? " · Overdue" : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}
