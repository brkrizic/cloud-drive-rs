import { fetchAuthSession } from "aws-amplify/auth";

export const getAuthToken = async () => {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) throw new Error("No valid JWT token");

  return token;
};