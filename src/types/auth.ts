export type AuthUser = {
  id: string;
  email: string;
};

export type AuthCredentials = {
  email: string;
  password: string;
};

export type AuthFieldErrors = Partial<Record<keyof AuthCredentials, string>>;

export type AuthResult = {
  user: AuthUser | null;
  needsConfirmation: boolean;
};

export type AuthRepository = {
  getSession: () => Promise<AuthUser | null>;
  getCachedSession: () => AuthUser | null;
  onAuthStateChange: (listener: (user: AuthUser | null) => void) => () => void;
  signIn: (credentials: AuthCredentials) => Promise<AuthResult>;
  signUp: (credentials: AuthCredentials) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

export const TEST_USER: AuthUser = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  email: "planner@example.com",
};

export const TEST_USER_PASSWORD = "password123";
