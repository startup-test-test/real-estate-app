// 認証チェック用JavaScript
(function() {
    const SESSION_KEY = 'ooya_dx_auth';
    const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24時間
    
    function checkAuth() {
        const authStatus = localStorage.getItem(SESSION_KEY);
        const timestamp = localStorage.getItem(SESSION_KEY + '_timestamp');
        
        // 認証情報がない場合
        if (!authStatus || authStatus !== 'authenticated') {
            redirectToAuth();
            return false;
        }
        
        // セッション期限切れチェック
        if (timestamp) {
            const sessionAge = Date.now() - parseInt(timestamp);
            if (sessionAge > SESSION_DURATION) {
                // セッション期限切れ
                localStorage.removeItem(SESSION_KEY);
                localStorage.removeItem(SESSION_KEY + '_timestamp');
                redirectToAuth();
                return false;
            }
        }
        
        return true;
    }
    
    function redirectToAuth() {
        // 認証ページ以外の場合のみリダイレクト
        if (!window.location.pathname.includes('auth.html')) {
            window.location.href = '/auth.html';
        }
    }
    
    // ページ読み込み時に認証チェック
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAuth);
    } else {
        checkAuth();
    }
    
    // ログアウト機能をグローバルに公開
    window.logout = function() {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(SESSION_KEY + '_timestamp');
        window.location.href = '/auth.html';
    };
})();