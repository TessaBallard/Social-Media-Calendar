import { act, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { App } from "../src/app/App";
import { createMemoryAuthRepository } from "../src/services/memoryAuthRepository";
import { createMemoryPostsRepository } from "../src/services/memoryPostsRepository";
import { createMemorySettingsRepository } from "../src/services/memorySettingsRepository";
import type { AppsRepository } from "../src/types/appRecord";
import type { AuthRepository } from "../src/types/auth";
import type { PostsRepository } from "../src/types/postRecord";
import type { SettingsRepository } from "../src/types/userSettings";
import { createMemoryAppsRepository } from "./memoryAppsRepository";

export async function renderApp(
  initialPath = "/",
  appsRepository?: AppsRepository,
  postsRepository?: PostsRepository,
  settingsRepository?: SettingsRepository,
  authRepository: AuthRepository = createMemoryAuthRepository(),
) {
  const peekUserId = () => authRepository.getCachedSession()?.id ?? null;
  const resolvedApps = appsRepository ?? createMemoryAppsRepository([], peekUserId);
  const resolvedPosts = postsRepository ?? createMemoryPostsRepository([], peekUserId);
  const resolvedSettings = settingsRepository ?? createMemorySettingsRepository(undefined, peekUserId);

  const view = render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App
        authRepository={authRepository}
        appsRepository={resolvedApps}
        postsRepository={resolvedPosts}
        settingsRepository={resolvedSettings}
      />
    </MemoryRouter>,
  );

  // Wait for the initial storage load so React state updates stay inside act().
  await act(async () => {
    await Promise.resolve();
  });

  return {
    appsRepository: resolvedApps,
    postsRepository: resolvedPosts,
    settingsRepository: resolvedSettings,
    authRepository,
    ...view,
  };
}
