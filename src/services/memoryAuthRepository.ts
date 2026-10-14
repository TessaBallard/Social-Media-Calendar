import { TEST_USER, TEST_USER_PASSWORD, type AuthCredentials, type AuthRepository, type AuthResult, type AuthUser } from "../types/auth";

type MemoryAccount = {
  id: string;
  email: string;
  password: string;
};

type MemoryAuthOptions = {
  user?: AuthUser | null;
  accounts?: MemoryAccount[];
};

export type MemoryAuthRepository = AuthRepository & {
  peekUserId: () => string | null;
};

function toUser(account: MemoryAccount): AuthUser {
  return { id: account.id, email: account.email };
}

function findAccount(accounts: MemoryAccount[], email: string): MemoryAccount | undefined {
  return accounts.find((account) => account.email.toLowerCase() === email.trim().toLowerCase());
}

// In-memory auth used only by tests. The real app signs in with Supabase.
export function createMemoryAuthRepository(
  options: MemoryAuthOptions = {},
): MemoryAuthRepository {
  const accounts: MemoryAccount[] = options.accounts ?? [
    { ...TEST_USER, password: TEST_USER_PASSWORD },
  ];
  let user: AuthUser | null =
    options.user === undefined ? TEST_USER : options.user;
  const listeners = new Set<(nextUser: AuthUser | null) => void>();

  function emit(nextUser: AuthUser | null): void {
    user = nextUser;
    for (const listener of listeners) {
      listener(nextUser);
    }
  }

  return {
    peekUserId(): string | null {
      return user?.id ?? null;
    },

    getCachedSession(): AuthUser | null {
      return user;
    },

    async getSession(): Promise<AuthUser | null> {
      return user;
    },

    onAuthStateChange(listener: (nextUser: AuthUser | null) => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    async signIn(credentials: AuthCredentials): Promise<AuthResult> {
      const account = findAccount(accounts, credentials.email);

      if (!account || account.password !== credentials.password) {
        throw new Error("That email or password is not correct.");
      }

      emit(toUser(account));
      return { user: toUser(account), needsConfirmation: false };
    },

    async signUp(credentials: AuthCredentials): Promise<AuthResult> {
      if (findAccount(accounts, credentials.email)) {
        throw new Error("An account with that email already exists. Sign in instead.");
      }

      const account: MemoryAccount = {
        id: crypto.randomUUID(),
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      };
      accounts.push(account);
      emit(toUser(account));
      return { user: toUser(account), needsConfirmation: false };
    },

    async signOut(): Promise<void> {
      emit(null);
    },
  };
}
