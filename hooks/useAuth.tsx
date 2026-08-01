import { useState, useEffect, useCallback } from "react";
import { 
  signUp,
  confirmSignUp,
  signIn,
  signOut,
  resetPassword,
  confirmResetPassword,
  getCurrentUser,
  resendSignUpCode,
  AuthError,
  SignInInput,
  SignUpInput,
  ResetPasswordInput,
  ConfirmResetPasswordInput,
  ConfirmSignUpInput,
  AuthUser,
  SignInOutput
} from 'aws-amplify/auth';
import { getUserToken } from "utils/getUserToken";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
};

export type MyUser = {
  id: string;
  username: string;
};

export type authState = "initializing" | "authenticated" | "unauthenticated"

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [authState, setAuthState] = useState<authState>('initializing');

  /** Fetch current authenticated user */
  const fetchUser = useCallback(async () => {
    setLoading(true);
    setAuthState("initializing");

    try {
      const u = await getCurrentUser();
      setUser(u);

      const token = await getUserToken();
      setToken(token);

      setAuthState("authenticated");
      setError(null);
    } catch (err: AuthError | any) {
      setUser(null);
      setToken(undefined);

      // 👇 THIS is the important part
      if (
        err.name === "UserUnAuthenticatedException" ||
        err.name === "NotAuthorizedException"
      ) {
        // normal state → user is not logged in
        setAuthState("unauthenticated");
        setError(null);
        return;
      }

      setAuthState("unauthenticated");
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Sign up */
  const register = useCallback(async (input: SignUpInput & { email: string }) => {
    setLoading(true);
    try {
      await signUp({...input, options: {
        userAttributes: {
            email: input.email,
        }
      }});
      setError(null);
    } catch (err: AuthError | any) {
      setError(err.message || "Sign up failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Confirm signup */
  const confirmRegistration = useCallback(async (input: ConfirmSignUpInput) => {
    setLoading(true);
    try {
      await confirmSignUp(input);
      setError(null);
    } catch (err: AuthError | any) {
      setError(err.message || "Confirmation failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Sign in */
  const login = useCallback(async (input: SignInInput) => {
    setLoading(true);
    setAuthState("initializing")
    try {
      const u = await signIn({...input, options: {authFlowType: "USER_PASSWORD_AUTH"}});
      setUser(u);
      setAuthState('authenticated');
      setError(null);
      return u;
    } catch (err: AuthError | any) {
      setAuthState('unauthenticated');
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Sign out */
  const logout = useCallback(async () => {
    console.log("Logging out...")
    setLoading(true);
    setAuthState('initializing')
    try {
      await signOut();
      setAuthState('unauthenticated');
      setUser(null);
      setError(null);
    } catch (err: AuthError | any) {
      setAuthState('authenticated');
      setError(err.message || "Logout failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Start reset password */
  const startReset = useCallback(async (input: ResetPasswordInput) => {
    setLoading(true);
    try {
      const result = await resetPassword(input);
      setError(null);
      return result;
    } catch (err: AuthError | any) {
      setError(err.message || "Reset failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Confirm reset password */
  const confirmReset = useCallback(async (input: ConfirmResetPasswordInput) => {
    setLoading(true);
    try {
      await confirmResetPassword(input);
      setError(null);
    } catch (err: AuthError | any) {
      setError(err.message || "Reset confirmation failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Resend signup code */
  const resendCode = useCallback(async (username: string) => {
    setLoading(true);
    try {
      await resendSignUpCode({ username });
      setError(null);
    } catch (err: AuthError | any) {
      setError(err.message || "Resend code failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    token,
    authState,
    loading,
    error,
    fetchUser,
    register,
    confirmRegistration,
    login,
    logout,
    startReset,
    confirmReset,
    resendCode
  };
}
