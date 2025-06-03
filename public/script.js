document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');
    const generateButton = document.getElementById('generate-button');
    const resultArea = document.getElementById('result-area');

    // ボタンクリック時の処理
    generateButton.addEventListener('click', async () => {
        const inputText = userInput.value.trim();
        
        // 入力チェック
        if (!inputText) {
            resultArea.textContent = 'テキストを入力してください。';
            resultArea.style.color = '#e74c3c';
            return;
        }
        
        // ローディング表示
        resultArea.textContent = 'AIがポジティブな日記を作成中です...';
        resultArea.className = 'result-area loading';
        
        try {
            // バックエンドにリクエストを送信
            console.log('リクエストを送信します:', inputText);
            const response = await fetch('/generate-diary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ inputText })
            });
            
            const data = await response.json();
            console.log('レスポンス受信:', data);
            
            if (!response.ok) {
                const errorMessage = data.details || 'サーバーエラーが発生しました';
                console.error('サーバーエラー:', data);
                throw new Error(errorMessage);
            }
            
            // 結果を表示
            if (data.success && data.positiveDiary) {
                resultArea.textContent = data.positiveDiary;
                resultArea.className = 'result-area';
                resultArea.style.color = '#333';
            } else {
                throw new Error(data.error || '日記の生成に失敗しました');
            }
            
        } catch (error) {
            console.error('Error:', error);
            resultArea.textContent = 'エラーが発生しました。もう一度お試しください。';
            resultArea.style.color = '#e74c3c';
            resultArea.className = 'result-area';
        }
    });
    
    // テキストエリアでのEnterキー入力を無効化
    userInput.addEventListener('keydown', (e) => {
        // 何もしない（ボタンクリック時のみ処理を実行）
    });
});