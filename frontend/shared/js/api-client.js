/**
 * API クライアント - 共通API呼び出し処理
 */

class APIClient {
    constructor() {
        this.baseURLs = {
            simulator: 'https://real-estate-app-1-iii4.onrender.com',
            property: 'https://property-api.onrender.com',
            auth: 'https://auth-api.onrender.com',
            payment: 'https://payment-api.onrender.com'
        };
        this.token = localStorage.getItem('authToken');
    }

    /**
     * 共通リクエスト処理
     */
    async request(service, endpoint, options = {}) {
        const url = `${this.baseURLs[service]}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // シミュレーターAPI
    async simulate(propertyData) {
        return this.request('simulator', '/api/simulate', {
            method: 'POST',
            body: JSON.stringify(propertyData)
        });
    }

    async marketAnalysis(data) {
        return this.request('simulator', '/api/market-analysis', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // 物件API（予定）
    async searchProperties(filters) {
        return this.request('property', '/api/search', {
            method: 'POST',
            body: JSON.stringify(filters)
        });
    }

    // 認証API（予定）
    async login(credentials) {
        const result = this.request('auth', '/api/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        if (result.token) {
            this.setToken(result.token);
        }
        
        return result;
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    removeToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }
}

// グローバルAPIクライアントインスタンス
window.apiClient = new APIClient();