import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/google-auth';

export async function POST(request: NextRequest) {
    const { query, engine } = await request.json();

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // トークン取得を自動化
    const accessToken = await getAccessToken();
    if (!accessToken) {
        return NextResponse.json({ error: 'Failed to obtain access token' }, { status: 500 });
    }

    const projectId = process.env.GCP_PROJECT_ID;
    // engineパラメータで切り替え
    const engineId =
        engine === 'sub'
            ? process.env.GCP_ENGINE_ID_YABUKI
            : process.env.GCP_ENGINE_ID_KOMAE;

    // ここでログ出力
    console.log("GCP_ENGINE_ID_KOMAE:", process.env.GCP_ENGINE_ID_KOMAE);
    console.log("GCP_ENGINE_ID_YABUKI:", process.env.GCP_ENGINE_ID_YABUKI);
    console.log("engine param:", engine);
    console.log("engineId:", engineId);

    const endpoint = `https://discoveryengine.googleapis.com/v1alpha/projects/${projectId}/locations/global/collections/default_collection/engines/${engineId}/servingConfigs/default_search:search`;

    const payload = {
        query,
        pageSize: 10,
        queryExpansionSpec: { condition: 'AUTO' },
        spellCorrectionSpec: { mode: 'AUTO' },
        languageCode: 'ja',
        userInfo: {
            timeZone: 'Etc/GMT-9',
        },
    };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching search results:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
