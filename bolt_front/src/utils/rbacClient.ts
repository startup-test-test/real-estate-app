/**
 * SEC-074: フロントエンド権限管理
 * ロールベースアクセス制御（RBAC）のクライアント実装
 */

// ユーザーロールの定義（バックエンドと同期）
export enum UserRole {
  ADMIN = 'admin',
  PREMIUM = 'premium',
  STANDARD = 'standard',
  GUEST = 'guest'
}

// 権限の定義（バックエンドと同期）
export enum Permission {
  // シミュレーション関連
  SIMULATE_BASIC = 'simulate:basic',
  SIMULATE_ADVANCED = 'simulate:advanced',
  SIMULATE_EXPORT = 'simulate:export',
  
  // 市場分析関連
  MARKET_ANALYSIS_BASIC = 'market:basic',
  MARKET_ANALYSIS_ADVANCED = 'market:advanced',
  
  // データ管理関連
  DATA_READ = 'data:read',
  DATA_WRITE = 'data:write',
  DATA_DELETE = 'data:delete',
  
  // ユーザー管理関連
  USER_MANAGE = 'user:manage',
  ROLE_MANAGE = 'role:manage',
  
  // API管理関連
  API_FULL_ACCESS = 'api:full'
}

/**
 * ユーザー権限情報
 */
export interface UserPermissions {
  role: UserRole;
  permissions: Permission[];
}

/**
 * 権限管理クラス
 */
export class RBACClient {
  private static instance: RBACClient;
  private userRole: UserRole | null = null;
  private userPermissions: Permission[] = [];

  private constructor() {}

  /**
   * シングルトンインスタンスを取得
   */
  static getInstance(): RBACClient {
    if (!RBACClient.instance) {
      RBACClient.instance = new RBACClient();
    }
    return RBACClient.instance;
  }

  /**
   * ユーザー権限情報を設定
   */
  setUserPermissions(role: string, permissions: string[]): void {
    this.userRole = role as UserRole;
    this.userPermissions = permissions as Permission[];
  }

  /**
   * ユーザー権限情報をクリア
   */
  clearPermissions(): void {
    this.userRole = null;
    this.userPermissions = [];
  }

  /**
   * 現在のユーザーロールを取得
   */
  getUserRole(): UserRole | null {
    return this.userRole;
  }

  /**
   * 現在のユーザー権限を取得
   */
  getUserPermissions(): Permission[] {
    return [...this.userPermissions];
  }

  /**
   * 特定の権限を持っているかチェック
   */
  hasPermission(permission: Permission): boolean {
    return this.userPermissions.includes(permission);
  }

  /**
   * 複数の権限のうちいずれかを持っているかチェック
   */
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * すべての権限を持っているかチェック
   */
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * 特定のロールかチェック
   */
  hasRole(role: UserRole): boolean {
    return this.userRole === role;
  }

  /**
   * 管理者かチェック
   */
  isAdmin(): boolean {
    return this.userRole === UserRole.ADMIN;
  }

  /**
   * プレミアムユーザーかチェック
   */
  isPremium(): boolean {
    return this.userRole === UserRole.PREMIUM || this.isAdmin();
  }

  /**
   * 機能が利用可能かチェック（UI表示制御用）
   */
  canAccessFeature(feature: string): boolean {
    const featurePermissionMap: Record<string, Permission[]> = {
      // シミュレーション機能
      'basic-simulation': [Permission.SIMULATE_BASIC],
      'advanced-simulation': [Permission.SIMULATE_ADVANCED],
      'export-simulation': [Permission.SIMULATE_EXPORT],
      
      // 市場分析機能
      'basic-market-analysis': [Permission.MARKET_ANALYSIS_BASIC],
      'advanced-market-analysis': [Permission.MARKET_ANALYSIS_ADVANCED],
      
      // データ管理機能
      'save-data': [Permission.DATA_WRITE],
      'delete-data': [Permission.DATA_DELETE],
      
      // 管理機能
      'user-management': [Permission.USER_MANAGE],
      'role-management': [Permission.ROLE_MANAGE],
    };

    const requiredPermissions = featurePermissionMap[feature];
    if (!requiredPermissions) {
      // 未定義の機能はデフォルトで許可
      return true;
    }

    return this.hasAnyPermission(requiredPermissions);
  }

  /**
   * 権限不足時のメッセージを取得
   */
  getPermissionDeniedMessage(requiredPermission?: Permission): string {
    if (!this.userRole) {
      return 'ログインが必要です';
    }

    if (this.userRole === UserRole.GUEST) {
      return 'この機能を利用するにはアカウント登録が必要です';
    }

    if (this.userRole === UserRole.STANDARD && requiredPermission) {
      const premiumPermissions = [
        Permission.SIMULATE_ADVANCED,
        Permission.SIMULATE_EXPORT,
        Permission.MARKET_ANALYSIS_ADVANCED
      ];
      
      if (premiumPermissions.includes(requiredPermission)) {
        return 'この機能はプレミアムプラン以上で利用可能です';
      }
    }

    return 'この操作を実行する権限がありません';
  }
}

// エクスポート
export const rbacClient = RBACClient.getInstance();