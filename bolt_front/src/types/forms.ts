/**
 * フォーム関連の型定義
 */

// プロパティ共有機能の型定義
export interface PropertyShare {
  id: string;
  property_id: string;
  owner_id: string;
  share_token: string;
  title?: string;
  description?: string;
  settings: {
    allow_comments: boolean;
    allow_download: boolean;
  };
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ShareInvitation {
  id: string;
  share_id: string;
  email: string;
  role: 'viewer' | 'commenter' | 'editor';
  user_type: 'family' | 'tax_accountant' | 'consultant' | 'general';
  invited_by: string;
  accepted_by?: string;
  invitation_token: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  accepted_at?: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface ShareComment {
  id: string;
  share_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  tags: string[];
  attachments: any[];
  metadata: Record<string, any>;
  is_edited: boolean;
  edited_at?: string;
  created_at: string;
  updated_at: string;
  // 追加フィールド（JOIN用）
  user?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
  reactions?: CommentReaction[];
  replies?: ShareComment[];
}

export interface CommentReaction {
  id: string;
  comment_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface ShareAccessLog {
  id: string;
  share_id: string;
  user_id?: string;
  invitation_id?: string;
  action: 'view' | 'comment' | 'edit' | 'download';
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// 共有機能の型定義
export interface ShareResult {
  id: string;
  simulation_id: string;
  share_code: string;
  expires_at: string | null;
  created_at: string;
  view_count: number;
  is_public: boolean;
}

// ユーザープロファイル型
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}