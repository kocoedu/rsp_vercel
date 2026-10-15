export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const apiKey = process.env.ROBOFLOW_API_KEY;
    const endpointUrl = process.env.ROBOFLOW_ENDPOINT || 'https://serverless.roboflow.com/processed-rock-paper/2';

    // Check if environment variables are configured
    if (!apiKey) {
        return res.status(500).json({ 
            error: '설정 오류: ROBOFLOW_API_KEY 환경변수가 설정되지 않았습니다. 테스트 모드로 동작합니다.' 
        });
    }

    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ error: '이미지 데이터가 전송되지 않았습니다.' });
        }

        // Call Roboflow serverless endpoint using Bearer token authentication
        const response = await fetch(endpointUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                inputs: {
                    image: {
                        type: 'url',
                        value: image
                    }
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Roboflow API error status ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        return res.status(200).json(result);

    } catch (error) {
        console.error('Prediction API proxy error:', error);
        return res.status(500).json({ error: error.message || '서버 내부 오류가 발생했습니다.' });
    }
}