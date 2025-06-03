require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 環境変数からAPIキーを取得
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error('エラー: GEMINI_API_KEYが設定されていません。.envファイルを確認してください。');
    process.exit(1);
}

// Gemini APIの初期化
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-pro-latest',  // 最新の安定版モデルを使用
    generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.9,  // より多様な出力を得るために温度を上げる (0.0-1.0)
        topP: 0.95,      // 多様性を高める
        topK: 40,        // サンプリングの幅を広げる
    },
});

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェアの設定
app.use(express.json());
app.use(express.static('public'));

// ルート
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// 日記生成APIエンドポイント
app.post('/generate-diary', async (req, res) => {
    try {
        console.log('リクエスト受信:', req.body);
        const { inputText } = req.body;
        
        if (!inputText) {
            console.log('入力テキストがありません');
            return res.status(400).json({ error: '入力テキストが必要です' });
        }
        
        // Geminiに送信するプロンプト
        const prompt = `ユーザーの入力: "${inputText}"

この内容を分析し、非常に前向きで、今日一日が素晴らしいものだったと祝福するような、心温まる短い一言の日記を創作してください。
ネガティブな言葉が含まれていても、それを乗り越えた強さや、そこから得られた気づきを讃えるような、希望に満ちた表現にしてください。
文字数は50〜70文字程度で、簡潔で読みやすい文章にしてください。`;

        console.log('Gemini APIを呼び出します...');
        
        try {
            // Gemini APIを呼び出し
            const result = await model.generateContent({
                contents: [{
                    role: 'user',
                    parts: [{ text: prompt }]
                }]
            });
            
            console.log('APIレスポンス受信:', result);
            
            // レスポンスからテキストを取得
            const response = await result.response;
            const text = response.text();
            console.log('生成されたテキスト:', text);
            
            // 結果を返す
            res.json({ 
                success: true,
                positiveDiary: text 
            });
            
        } catch (apiError) {
            console.error('Gemini API呼び出しエラー:', apiError);
            console.error('エラースタック:', apiError.stack);
            throw new Error(`Gemini APIエラー: ${apiError.message}`);
        }
        
    } catch (error) {
        console.error('エラー詳細:', error);
        console.error('エラースタック:', error.stack);
        
        res.status(500).json({ 
            success: false,
            error: '日記の生成中にエラーが発生しました',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: '何か問題が発生しました' });
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`サーバーがポート${PORT}で起動しました`);
    console.log(`http://localhost:${PORT}`);
});