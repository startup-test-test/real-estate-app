export type AuthUser = {
  id: string;
  email?: string | null;
  displayName?: string | null;
  primaryEmailVerified?: boolean | null;
};

export type AuthClient = {
  user: AuthUser | null;
  isLoading: boolean;
  error?: string | null;
  signIn: (opts: {
    email: string;
    password: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  signUp: (opts: {
    email: string;
    password: string;
  }) => Promise<{ ok: boolean; info?: string; error?: string }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendPasswordReset?: (
    email: string
  ) => Promise<{ ok: boolean; error?: string }>;
  resendEmailVerification?: () => Promise<{ ok: boolean; error?: string }>;
  deleteUser?: () => Promise<{ ok: boolean; error?: string }>;
};
