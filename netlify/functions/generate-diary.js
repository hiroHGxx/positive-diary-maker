const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.handler = async function(event, context) {
    try {
        // 環境変数からAPIキーを取得
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'APIキーが設定されていません' })
            };
        }

        // リクエストボディの解析
        const { inputText } = JSON.parse(event.body);
        if (!inputText) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: '入力テキストが必要です' })
            };
        }

        // Gemini APIの初期化
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-1.5-pro-latest',
            generationConfig: {
                maxOutputTokens: 100,
                temperature: 0.9,
                topP: 0.95,
                topK: 40,
            },
        });

        // プロンプトの構築
        const prompt = `ユーザーの入力: "${inputText}"

この内容を分析し、非常に前向きで、今日一日が素晴らしいものだったと祝福するような、心温まる短い一言の日記を創作してください。
ネガティブな言葉が含まれていても、それを乗り越えた強さや、そこから得られた気づきを讃えるような、希望に満ちた表現にしてください。
文字数は50〜70文字程度で、必ず日本語で返してください。`;

        // Gemini APIを呼び出し
        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{ text: prompt }]
            }]
        });
        
        const response = await result.response;
        const text = response.text();

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                success: true, 
                positiveDiary: text 
            })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: '日記の生成中にエラーが発生しました',
                details: error.message 
            })
        };
    }
};
