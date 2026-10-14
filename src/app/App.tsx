import { AuthenticatedApp } from "../components/AuthenticatedApp";
import { AppErrorBoundary } from "../components/AppErrorBoundary";
import { RequireAuth } from "../components/RequireAuth";
import { AuthProvider } from "../hooks/useAuth";
import { ColorSchemeProvider } from "../hooks/useColorScheme";
import { supabaseAppsRepository } from "../services/appsRepository";
import { supabaseAuthRepository } from "../services/authRepository";
import { supabasePostsRepository } from "../services/postsRepository";
import { supabaseSettingsRepository } from "../services/settingsRepository";
import type { AppsRepository } from "../types/appRecord";
import type { AuthRepository } from "../types/auth";
import type { PostsRepository } from "../types/postRecord";
import type { SettingsRepository } from "../types/userSettings";
import { AppRoutes } from "./AppRoutes";

type AppProps = {
  authRepository?: AuthRepository;
  appsRepository?: AppsRepository;
  postsRepository?: PostsRepository;
  settingsRepository?: SettingsRepository;
};

export function App({
  authRepository = supabaseAuthRepository,
  appsRepository = supabaseAppsRepository,
  postsRepository = supabasePostsRepository,
  settingsRepository = supabaseSettingsRepository,
}: AppProps) {
  return (
    <AppErrorBoundary>
      <ColorSchemeProvider>
        <AuthProvider repository={authRepository}>
          <AppRoutes
            authenticated={
              <AuthenticatedApp
                appsRepository={appsRepository}
                postsRepository={postsRepository}
                settingsRepository={settingsRepository}
              />
            }
            requireAuth={<RequireAuth />}
          />
        </AuthProvider>
      </ColorSchemeProvider>
    </AppErrorBoundary>
  );
}
