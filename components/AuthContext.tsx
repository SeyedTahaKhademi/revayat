"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Gender = "female" | "male";
type Role = "admin" | "user";

export interface Account {
  id: string;
  username: string;
  fullName: string;
  phone: string;
  password: string;
  gender: Gender;
  role: Role;
  createdAt: string;
}

export interface RegisterPayload {
  username: string;
  fullName: string;
  phone: string;
  password: string;
  gender: Gender;
}

export type AuthResult = { success: boolean; message?: string };

interface AuthContextValue {
  accounts: Account[];
  currentUser?: Account;
  login: (phone: string, password: string) => AuthResult;
  logout: () => void;
  register: (payload: RegisterPayload) => AuthResult;
  deleteAccount: (accountId: string) => AuthResult;
  promoteToAdmin: (accountId: string) => AuthResult;
}

const ACCOUNTS_STORAGE_KEY = "revayat.accounts.v1";
const ACTIVE_ACCOUNT_STORAGE_KEY = "revayat.activeAccountId";

const ADMIN_ACCOUNT: Account = {
  id: "revayat-admin",
  username: "ادمین روایت",
  fullName: "حساب مدیر روایت",
  phone: "09055430140",
  password: "Yousefking",
  gender: "male",
  role: "admin",
  createdAt: "2024-01-01T00:00:00.000Z",
};

const ensureAdminAccount = (items: Account[]): Account[] => {
  const hasAdmin = items.some((acc) => acc.phone === ADMIN_ACCOUNT.phone);
  if (hasAdmin) return items;
  return [...items, { ...ADMIN_ACCOUNT }];
};

const readAccounts = (): Account[] => {
  if (typeof window === "undefined") {
    return ensureAdminAccount([]);
  }
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) return ensureAdminAccount([]);
    const parsed = JSON.parse(raw) as Account[];
    if (!Array.isArray(parsed)) return ensureAdminAccount([]);
    return ensureAdminAccount(
      parsed.map((item) => ({
        ...item,
        role: item.role === "admin" ? "admin" : "user",
      }))
    );
  } catch {
    return ensureAdminAccount([]);
  }
};

const readActiveAccount = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ACTIVE_ACCOUNT_STORAGE_KEY);
  } catch {
    return null;
  }
};

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `acc-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [accounts, setAccounts] = useState<Account[]>(() => readAccounts());
  const [activeAccountId, setActiveAccountId] = useState<string | null>(() =>
    readActiveAccount()
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        ACCOUNTS_STORAGE_KEY,
        JSON.stringify(ensureAdminAccount(accounts))
      );
    } catch {
      /* no-op */
    }
  }, [accounts]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!activeAccountId) {
      window.localStorage.removeItem(ACTIVE_ACCOUNT_STORAGE_KEY);
      return;
    }
    try {
      window.localStorage.setItem(ACTIVE_ACCOUNT_STORAGE_KEY, activeAccountId);
    } catch {
      /* no-op */
    }
  }, [activeAccountId]);

  const currentUser = useMemo(
    () => accounts.find((acc) => acc.id === activeAccountId),
    [accounts, activeAccountId]
  );

  const login = useCallback(
    (phone: string, password: string): AuthResult => {
      const normalizedPhone = phone.trim();
      const candidate = accounts.find(
        (acc) =>
          acc.phone.replace(/\s+/g, "") === normalizedPhone.replace(/\s+/g, "")
      );
      if (!candidate || candidate.password !== password) {
        return { success: false, message: "شماره یا رمز عبور نادرست است." };
      }
      setActiveAccountId(candidate.id);
      return { success: true };
    },
    [accounts]
  );

  const logout = useCallback(() => {
    setActiveAccountId(null);
  }, []);

  const register = useCallback(
    (payload: RegisterPayload): AuthResult => {
      const normalizedPhone = payload.phone.replace(/\s+/g, "");
      if (!normalizedPhone) {
        return { success: false, message: "شماره تلفن وارد نشده است." };
      }
      const duplicatePhone = accounts.some(
        (acc) => acc.phone.replace(/\s+/g, "") === normalizedPhone
      );
      if (duplicatePhone) {
        return {
          success: false,
          message: "برای این شماره از قبل حسابی وجود دارد.",
        };
      }
      const duplicateUsername = accounts.some(
        (acc) =>
          acc.username.trim().toLowerCase() ===
          payload.username.trim().toLowerCase()
      );
      if (duplicateUsername) {
        return {
          success: false,
          message: "این نام کاربری قبلاً استفاده شده است.",
        };
      }
      const account: Account = {
        id: createId(),
        username: payload.username.trim(),
        fullName: payload.fullName.trim(),
        phone: normalizedPhone,
        password: payload.password,
        gender: payload.gender,
        role: "user",
        createdAt: new Date().toISOString(),
      };
      setAccounts((prev) => [...prev, account]);
      setActiveAccountId(account.id);
      return { success: true };
    },
    [accounts]
  );

  const deleteAccount = useCallback(
    (accountId: string): AuthResult => {
      const target = accounts.find((acc) => acc.id === accountId);
      if (!target) {
        return { success: false, message: "حساب پیدا نشد." };
      }
      if (target.role === "admin") {
        return { success: false, message: "نمی‌توانید ادمین را حذف کنید." };
      }
      setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
      setActiveAccountId((prev) => (prev === accountId ? null : prev));
      return { success: true };
    },
    [accounts]
  );

  const promoteToAdmin = useCallback(
    (accountId: string): AuthResult => {
      const target = accounts.find((acc) => acc.id === accountId);
      if (!target) {
        return { success: false, message: "حساب پیدا نشد." };
      }
      if (target.role === "admin") {
        return { success: false, message: "این حساب از قبل ادمین است." };
      }
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === accountId ? { ...acc, role: "admin" } : acc
        )
      );
      return { success: true, message: "حساب با موفقیت به ادمین ارتقا یافت." };
    },
    [accounts]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      accounts,
      currentUser,
      login,
      logout,
      register,
      deleteAccount,
      promoteToAdmin,
    }),
    [accounts, currentUser, login, logout, register, deleteAccount, promoteToAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
