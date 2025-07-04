import { GoogleAuth } from "google-auth-library";

const auth = new GoogleAuth({
  // Could not refresh access tokenが出るのでこのスコープ
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

export async function getAccessToken(): Promise<string | undefined> {
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  return tokenResponse?.token ?? undefined;
}
