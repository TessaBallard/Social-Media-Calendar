import { AppsProvider } from "../hooks/useApps";
import { PostsProvider } from "../hooks/usePosts";
import { SettingsProvider } from "../hooks/useSettings";
import type { AppsRepository } from "../types/appRecord";
import type { PostsRepository } from "../types/postRecord";
import type { SettingsRepository } from "../types/userSettings";
import { Layout } from "./Layout";

type AuthenticatedAppProps = {
  appsRepository: AppsRepository;
  postsRepository: PostsRepository;
  settingsRepository: SettingsRepository;
};

// Loads one signed-in user's apps, posts, and settings after RequireAuth.
export function AuthenticatedApp({
  appsRepository,
  postsRepository,
  settingsRepository,
}: AuthenticatedAppProps) {
  return (
    <SettingsProvider repository={settingsRepository}>
      <AppsProvider repository={appsRepository}>
        <PostsProvider repository={postsRepository}>
          <Layout />
        </PostsProvider>
      </AppsProvider>
    </SettingsProvider>
  );
}
