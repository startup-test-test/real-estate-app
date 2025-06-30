import { supabase } from '../lib/supabase';

// ランダムな共有IDを生成（12文字）
export function generateShareId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 共有URLを生成
export function generateShareUrl(shareId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/share/${shareId}`;
}

// シミュレーション結果を共有用に保存
export async function createShare(propertyId: string, simulationData: any, propertyData: any) {
  try {
    // ユーザー認証の確認
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('ログインが必要です');
    }

    // 一意の共有IDを生成
    let shareId = generateShareId();
    let attempts = 0;
    
    // 既存のIDと重複しないか確認（最大5回試行）
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from('simulation_shares')
        .select('id')
        .eq('share_id', shareId)
        .single();
      
      if (!existing) break;
      
      shareId = generateShareId();
      attempts++;
    }

    if (attempts >= 5) {
      throw new Error('共有IDの生成に失敗しました');
    }

    // 共有データを保存
    const { data, error } = await supabase
      .from('simulation_shares')
      .insert({
        share_id: shareId,
        user_id: user.id,
        simulation_data: simulationData,
        property_data: propertyData,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      shareId: shareId,
      shareUrl: generateShareUrl(shareId),
      expiresAt: data.expires_at
    };
  } catch (error) {
    console.error('共有の作成に失敗しました:', error);
    throw error;
  }
}

// 共有データを取得
export async function getShareData(shareId: string) {
  try {
    // 共有データを取得
    const { data, error } = await supabase
      .from('simulation_shares')
      .select('*')
      .eq('share_id', shareId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('共有データが見つかりません');

    // 期限切れチェック
    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      throw new Error('この共有リンクは期限切れです');
    }

    // 閲覧回数を更新
    await supabase
      .from('simulation_shares')
      .update({ view_count: data.view_count + 1 })
      .eq('share_id', shareId);

    return {
      simulationData: data.simulation_data,
      propertyData: data.property_data,
      createdAt: data.created_at,
      expiresAt: data.expires_at,
      viewCount: data.view_count + 1
    };
  } catch (error) {
    console.error('共有データの取得に失敗しました:', error);
    throw error;
  }
}

// クリップボードにコピー
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // フォールバック: 旧式の方法
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      return true;
    } catch (err) {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

// 共有期限の残り時間を計算
export function getTimeUntilExpiry(expiresAt: string): string {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();
  
  if (diff <= 0) return '期限切れ';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    return `残り${days}日${hours}時間`;
  } else if (hours > 0) {
    return `残り${hours}時間`;
  } else {
    const minutes = Math.floor(diff / (1000 * 60));
    return `残り${minutes}分`;
  }
}