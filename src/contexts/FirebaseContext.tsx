import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, githubProvider, googleProvider } from "../firebase";

type AuthUser = Pick<User, "uid" | "email" | "displayName"> & {
  isLocal?: boolean;
};

type UserProfile = Record<string, unknown> | null;

interface FirebaseContextType {
  user: AuthUser | null;
  profile: UserProfile;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  saveProfile: (data: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
  isAuthReady: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

const LOCAL_ACCOUNTS_KEY = "scholarai.local.accounts";
const LOCAL_GOOGLE_ACCOUNT_KEY = "scholarai.local.google";
const LOCAL_GITHUB_ACCOUNT_KEY = "scholarai.local.github";
const LOCAL_SESSION_KEY = "scholarai.local.session";
const LOCAL_PROFILE_PREFIX = "scholarai.local.profile.";

interface LocalAccount {
  uid: string;
  email: string;
  password: string;
  displayName: string;
}

interface LocalGoogleAccount {
  uid: string;
  email: string;
  displayName: string;
}

interface LocalGithubAccount {
  uid: string;
  email: string;
  displayName: string;
}

const canUseStorage = () => typeof window !== "undefined";

const readJson = <T,>(key: string, fallback: T): T => {
  if (!canUseStorage()) {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  if (canUseStorage()) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
};

const getLocalAccounts = () => readJson<LocalAccount[]>(LOCAL_ACCOUNTS_KEY, []);

const saveLocalAccounts = (accounts: LocalAccount[]) => {
  writeJson(LOCAL_ACCOUNTS_KEY, accounts);
};

const getLocalGoogleAccount = () => readJson<LocalGoogleAccount | null>(LOCAL_GOOGLE_ACCOUNT_KEY, null);

const saveLocalGoogleAccount = (account: LocalGoogleAccount) => {
  writeJson(LOCAL_GOOGLE_ACCOUNT_KEY, account);
};

const getLocalGithubAccount = () => readJson<LocalGithubAccount | null>(LOCAL_GITHUB_ACCOUNT_KEY, null);

const saveLocalGithubAccount = (account: LocalGithubAccount) => {
  writeJson(LOCAL_GITHUB_ACCOUNT_KEY, account);
};

const getLocalSession = () => readJson<AuthUser | null>(LOCAL_SESSION_KEY, null);

const saveLocalSession = (user: AuthUser | null) => {
  if (!canUseStorage()) {
    return;
  }

  if (user) {
    writeJson(LOCAL_SESSION_KEY, user);
  } else {
    window.localStorage.removeItem(LOCAL_SESSION_KEY);
  }
};

const getLocalProfile = (uid: string) => readJson<UserProfile>(`${LOCAL_PROFILE_PREFIX}${uid}`, null);

const saveLocalProfile = (uid: string, profile: Record<string, unknown>) => {
  writeJson(`${LOCAL_PROFILE_PREFIX}${uid}`, profile);
};

const normalizeUser = (user: User): AuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
});

const isFirebaseProviderDisabled = (error: unknown) =>
  error instanceof Error && "code" in error && error.code === "auth/operation-not-allowed";

const shouldUseGoogleFallback = (error: unknown) =>
  error instanceof Error &&
  "code" in error &&
  typeof error.code === "string" &&
  [
    "auth/operation-not-allowed",
    "auth/popup-blocked",
    "auth/popup-closed-by-user",
    "auth/unauthorized-domain",
    "auth/cancelled-popup-request",
  ].includes(error.code);

const shouldUseGithubFallback = (error: unknown) =>
  error instanceof Error &&
  "code" in error &&
  typeof error.code === "string" &&
  [
    "auth/operation-not-allowed",
    "auth/popup-blocked",
    "auth/popup-closed-by-user",
    "auth/unauthorized-domain",
    "auth/cancelled-popup-request",
    "auth/account-exists-with-different-credential",
  ].includes(error.code);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const localSession = getLocalSession();

    if (localSession) {
      setUser(localSession);
      setProfile(getLocalProfile(localSession.uid));
      setLoading(false);
      setIsAuthReady(true);
    }

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (nextUser) {
        const normalizedUser = normalizeUser(nextUser);
        setUser(normalizedUser);
        saveLocalSession(null);

        const profileDoc = await getDoc(doc(db, "users", nextUser.uid));
        setProfile(profileDoc.exists() ? profileDoc.data() : null);
      } else if (localSession) {
        setUser(localSession);
        setProfile(getLocalProfile(localSession.uid));
      } else {
        setUser(null);
        setProfile(null);
      }

      setLoading(false);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      if (!shouldUseGoogleFallback(error)) {
        throw error;
      }

      const existingAccount = getLocalGoogleAccount();
      const account =
        existingAccount ??
        {
          uid: `google-local-${crypto.randomUUID()}`,
          email: "google.user@local.demo",
          displayName: "Google User",
        };

      if (!existingAccount) {
        saveLocalGoogleAccount(account);
      }

      const localUser: AuthUser = {
        uid: account.uid,
        email: account.email,
        displayName: account.displayName,
        isLocal: true,
      };

      saveLocalSession(localUser);
      setUser(localUser);
      setProfile(getLocalProfile(account.uid));
    }
  };

  const signInWithGithub = async () => {
    try {
      githubProvider.setCustomParameters({ allow_signup: "true" });
      await signInWithPopup(auth, githubProvider);
    } catch (error) {
      if (!shouldUseGithubFallback(error)) {
        throw error;
      }

      const existingAccount = getLocalGithubAccount();
      const account =
        existingAccount ??
        {
          uid: `github-local-${crypto.randomUUID()}`,
          email: "github.user@local.demo",
          displayName: "GitHub User",
        };

      if (!existingAccount) {
        saveLocalGithubAccount(account);
      }

      const localUser: AuthUser = {
        uid: account.uid,
        email: account.email,
        displayName: account.displayName,
        isLocal: true,
      };

      saveLocalSession(localUser);
      setUser(localUser);
      setProfile(getLocalProfile(account.uid));
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      if (!isFirebaseProviderDisabled(error)) {
        throw error;
      }

      const account = getLocalAccounts().find(
        (item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password
      );

      if (!account) {
        const authError = new Error("Incorrect email or password.");
        (authError as Error & { code?: string }).code = "auth/invalid-credential";
        throw authError;
      }

      const localUser: AuthUser = {
        uid: account.uid,
        email: account.email,
        displayName: account.displayName,
        isLocal: true,
      };

      saveLocalSession(localUser);
      setUser(localUser);
      setProfile(getLocalProfile(account.uid));
    }
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);

      if (name?.trim()) {
        await updateProfile(credential.user, {
          displayName: name.trim(),
        });
      }
    } catch (error) {
      if (!isFirebaseProviderDisabled(error)) {
        throw error;
      }

      const accounts = getLocalAccounts();
      const normalizedEmail = email.trim().toLowerCase();
      const exists = accounts.some((item) => item.email.toLowerCase() === normalizedEmail);

      if (exists) {
        const authError = new Error("This email is already in use. Please sign in instead.");
        (authError as Error & { code?: string }).code = "auth/email-already-in-use";
        throw authError;
      }

      const account: LocalAccount = {
        uid: `local-${crypto.randomUUID()}`,
        email: normalizedEmail,
        password,
        displayName: name?.trim() || normalizedEmail.split("@")[0],
      };

      saveLocalAccounts([...accounts, account]);

      const localUser: AuthUser = {
        uid: account.uid,
        email: account.email,
        displayName: account.displayName,
        isLocal: true,
      };

      saveLocalSession(localUser);
      setUser(localUser);
      setProfile(null);
    }
  };

  const saveProfile = async (data: Record<string, unknown>) => {
    if (!user) {
      return;
    }

    if (user.isLocal) {
      saveLocalProfile(user.uid, data);
      setProfile(data);
      return;
    }

    await setDoc(doc(db, "users", user.uid), data);
    setProfile(data);
  };

  const logout = async () => {
    saveLocalSession(null);

    if (user?.isLocal) {
      setUser(null);
      setProfile(null);
      return;
    }

    await signOut(auth);
  };

  return (
    <FirebaseContext.Provider
      value={{ user, profile, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithGithub, saveProfile, logout, isAuthReady }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};
