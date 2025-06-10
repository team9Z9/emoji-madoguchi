import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const { query } = await request.json();

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // GCP Discovery Engine API を使用するロジック
    const accessToken = process.env.GCP_ACCESS_TOKEN;
    const projectId = process.env.GCP_PROJECT_ID;
    const engineId = process.env.GCP_ENGINE_ID;

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
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching search results:', error);
        return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
    }
}
