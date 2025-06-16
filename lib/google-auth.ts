import { GoogleAuth } from 'google-auth-library';

const auth = new GoogleAuth({
    scopes: [
        'https://www.googleapis.com/auth/discoveryengine',
        'https://www.googleapis.com/auth/cloud-platform.read-only'
    ],
});

export async function getAccessToken(): Promise<string | undefined> {
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    return tokenResponse?.token ?? undefined;
}
