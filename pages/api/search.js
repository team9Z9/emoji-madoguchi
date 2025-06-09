export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { query } = req.body;

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

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        return res.status(200).json(data);
    } catch (error) {
        return res
            .status(500)
            .json({ error: 'Failed to fetch search results', detail: error.message });
    }
}
