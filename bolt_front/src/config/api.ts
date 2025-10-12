/**
 * API設定管理
 * 環境に応じたRender APIのURLを管理
 */

import { getCurrentEnvironment, Environment, getEnvironmentInfo } from './environment';

/**
 * 環境別のRender API URLs
 * 本番と開発でAPIを分離
 */
const API_URLS = {
  [Environment.PRODUCTION]: 'https://real-estate-app-1-iii4.onrender.com',  // 本番API
  [Environment.DEVELOPMENT]: 'https://real-estate-app-rwf1.onrender.com',   // 開発API
  [Environment.CODESPACES]: 'https://real-estate-app-rwf1.onrender.com',    // 開発APIを使用
  [Environment.LOCAL]: 'https://real-estate-app-rwf1.onrender.com'          // 開発APIを使用
} as const;

/**
 * 現在の環境に応じたSimulator API URLを取得
 * @returns {string} API URL
 */
export const getSimulatorApiUrl = (): string => {
  const environment = getCurrentEnvironment();
  const url = API_URLS[environment];

  // デバッグ情報（開発時のみ）
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔧 API URL resolved: ${url} (Environment: ${environment})`);
  }

  return url;
};

/**
 * APIエンドポイント定義
 * 各APIのエンドポイントを一元管理
 */
export const API_ENDPOINTS = {
  // ベースURL
  BASE: getSimulatorApiUrl(),
  
  // 個別エンドポイント（必要に応じて関数化）
  get HEALTH() {
    return `${getSimulatorApiUrl()}/`;
  },
  get SIMULATE() {
    return `${getSimulatorApiUrl()}/api/simulate`;
  },
  get MARKET_ANALYSIS() {
    return `${getSimulatorApiUrl()}/api/market-analysis`;
  }
} as const;

/**
 * API設定情報を取得（デバッグ用）
 * @returns API設定の詳細情報
 */
export const getApiConfig = () => {
  const environment = getCurrentEnvironment();
  const apiUrl = getSimulatorApiUrl();
  const envInfo = getEnvironmentInfo();
  
  return {
    environment,
    apiUrl,
    endpoints: {
      health: API_ENDPOINTS.HEALTH,
      simulate: API_ENDPOINTS.SIMULATE,
      marketAnalysis: API_ENDPOINTS.MARKET_ANALYSIS
    },
    hostname: envInfo.hostname,
    isProduction: envInfo.isProduction,
    timestamp: new Date().toISOString()
  };
};

/**
 * コンソールにAPI設定を表示（開発時のみ）
 * 環境判定とAPI URLの確認用
 */
export const debugApiConfig = (): void => {
  const config = getApiConfig();
  const envInfo = getEnvironmentInfo();
  
  if (envInfo.isProduction) {
    // 本番環境では最小限の情報のみ
    console.log('🚀 Production API configured');
  } else {
    // 開発環境では詳細情報を表示
    console.group('🔧 API Configuration Debug');
    console.table({
      'Environment': config.environment,
      'Hostname': config.hostname,
      'API URL': config.apiUrl,
      'Is Production': config.isProduction,
      'Is Development': envInfo.isDevelopment,
      'Is Codespaces': envInfo.isCodespaces,
      'Is Local': envInfo.isLocal
    });
    console.log('📍 Endpoints:', config.endpoints);
    console.log('🕐 Timestamp:', config.timestamp);
    console.groupEnd();
  }
};