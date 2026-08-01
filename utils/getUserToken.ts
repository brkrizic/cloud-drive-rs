import { fetchAuthSession } from "aws-amplify/auth";
import { jwtDecode } from "jwt-decode";

type AuthTokenData = {
  sub: string;
  email: string;
  email_verified: boolean;
  "cognito:username": string;
  [key: string]: any; // for extra fields
};

export async function getUserToken() {
  const session = await fetchAuthSession({ forceRefresh: true });
  const token = session.tokens?.idToken?.toString();
  return token;
}

export async function getUserId() {
  const token = await getUserToken();
  if (!token) throw new Error("No valid idToken");

  const decoded: { sub: string; [key: string]: any } = jwtDecode(token);
  return decoded.sub;
}

export const getUserData = async (token: string): Promise<AuthTokenData | null> => {
  if (!token) return null;

  try {
    const data = jwtDecode<AuthTokenData>(token);
    return data;
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
};
