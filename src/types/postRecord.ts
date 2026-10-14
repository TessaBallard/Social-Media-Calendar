export const POST_STATUSES = [
  "Planned",
  "In Progress",
  "Ready",
  "Posted",
  "Cancelled",
] as const;

export const POST_PRIORITIES = ["Low", "Normal", "High", "Urgent"] as const;

export const POST_PLATFORMS = [
  "Instagram",
  "Facebook",
  "TikTok",
  "YouTube",
  "X",
  "LinkedIn",
  "Other",
] as const;

export type PostStatus = (typeof POST_STATUSES)[number];
export type PostPriority = (typeof POST_PRIORITIES)[number];
export type PostPlatform = (typeof POST_PLATFORMS)[number];

export type PostFormValues = {
  title: string;
  appId: string;
  platform: string;
  dueDate: string;
  status: string;
  priority: string;
  notes: string;
  content: string;
};

export type PostFormErrors = Partial<Record<keyof PostFormValues, string>>;

// A planned social media post.
export type PostRecord = {
  id: string;
  title: string;
  appId: string;
  platform: PostPlatform;
  dueDate: string;
  status: PostStatus;
  priority: PostPriority;
  notes: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
};

export type PostRow = {
  id: string;
  title: string;
  app_id: string;
  platform: string;
  due_date: string;
  status: string;
  priority: string;
  notes: string | null;
  content: string | null;
  created_at: string;
  updated_at: string;
  user_id?: string | null;
};

export type PostsRepository = {
  listPosts: () => Promise<PostRecord[]>;
  createPost: (values: PostFormValues) => Promise<PostRecord>;
  updatePost: (id: string, values: PostFormValues) => Promise<PostRecord>;
  deletePost: (id: string) => Promise<void>;
};

export const EMPTY_POST_FORM: PostFormValues = {
  title: "",
  appId: "",
  platform: "",
  dueDate: "",
  status: "Planned",
  priority: "Normal",
  notes: "",
  content: "",
};
