/**
 * SEC-074: フロントエンドRBACクライアントのテスト
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { rbacClient, UserRole, Permission } from '../rbacClient';

describe('RBACClient', () => {
  beforeEach(() => {
    // 各テストの前に権限をクリア
    rbacClient.clearPermissions();
  });

  describe('権限設定と取得', () => {
    it('ユーザー権限を設定できること', () => {
      rbacClient.setUserPermissions(UserRole.ADMIN, [
        Permission.SIMULATE_BASIC,
        Permission.SIMULATE_ADVANCED,
        Permission.USER_MANAGE
      ]);

      expect(rbacClient.getUserRole()).toBe(UserRole.ADMIN);
      expect(rbacClient.getUserPermissions()).toHaveLength(3);
    });

    it('権限をクリアできること', () => {
      rbacClient.setUserPermissions(UserRole.STANDARD, [Permission.SIMULATE_BASIC]);
      rbacClient.clearPermissions();

      expect(rbacClient.getUserRole()).toBeNull();
      expect(rbacClient.getUserPermissions()).toHaveLength(0);
    });
  });

  describe('権限チェック', () => {
    it('特定の権限を持っているかチェックできること', () => {
      rbacClient.setUserPermissions(UserRole.STANDARD, [
        Permission.SIMULATE_BASIC,
        Permission.DATA_READ
      ]);

      expect(rbacClient.hasPermission(Permission.SIMULATE_BASIC)).toBe(true);
      expect(rbacClient.hasPermission(Permission.USER_MANAGE)).toBe(false);
    });

    it('複数権限のうちいずれかを持っているかチェックできること', () => {
      rbacClient.setUserPermissions(UserRole.PREMIUM, [
        Permission.SIMULATE_ADVANCED,
        Permission.MARKET_ANALYSIS_ADVANCED
      ]);

      expect(rbacClient.hasAnyPermission([
        Permission.SIMULATE_BASIC,
        Permission.SIMULATE_ADVANCED
      ])).toBe(true);

      expect(rbacClient.hasAnyPermission([
        Permission.USER_MANAGE,
        Permission.ROLE_MANAGE
      ])).toBe(false);
    });

    it('すべての権限を持っているかチェックできること', () => {
      rbacClient.setUserPermissions(UserRole.ADMIN, [
        Permission.SIMULATE_BASIC,
        Permission.SIMULATE_ADVANCED,
        Permission.USER_MANAGE
      ]);

      expect(rbacClient.hasAllPermissions([
        Permission.SIMULATE_BASIC,
        Permission.SIMULATE_ADVANCED
      ])).toBe(true);

      expect(rbacClient.hasAllPermissions([
        Permission.SIMULATE_BASIC,
        Permission.DATA_DELETE
      ])).toBe(false);
    });
  });

  describe('ロールチェック', () => {
    it('特定のロールかチェックできること', () => {
      rbacClient.setUserPermissions(UserRole.PREMIUM, []);

      expect(rbacClient.hasRole(UserRole.PREMIUM)).toBe(true);
      expect(rbacClient.hasRole(UserRole.ADMIN)).toBe(false);
    });

    it('管理者かチェックできること', () => {
      rbacClient.setUserPermissions(UserRole.ADMIN, []);
      expect(rbacClient.isAdmin()).toBe(true);

      rbacClient.setUserPermissions(UserRole.STANDARD, []);
      expect(rbacClient.isAdmin()).toBe(false);
    });

    it('プレミアムユーザーかチェックできること', () => {
      // プレミアムユーザー
      rbacClient.setUserPermissions(UserRole.PREMIUM, []);
      expect(rbacClient.isPremium()).toBe(true);

      // 管理者もプレミアム扱い
      rbacClient.setUserPermissions(UserRole.ADMIN, []);
      expect(rbacClient.isPremium()).toBe(true);

      // 標準ユーザーは違う
      rbacClient.setUserPermissions(UserRole.STANDARD, []);
      expect(rbacClient.isPremium()).toBe(false);
    });
  });

  describe('機能アクセスチェック', () => {
    it('基本シミュレーション機能へのアクセスをチェックできること', () => {
      rbacClient.setUserPermissions(UserRole.STANDARD, [Permission.SIMULATE_BASIC]);
      expect(rbacClient.canAccessFeature('basic-simulation')).toBe(true);

      rbacClient.setUserPermissions(UserRole.GUEST, [Permission.DATA_READ]);
      expect(rbacClient.canAccessFeature('basic-simulation')).toBe(false);
    });

    it('高度な機能へのアクセスをチェックできること', () => {
      rbacClient.setUserPermissions(UserRole.PREMIUM, [
        Permission.SIMULATE_ADVANCED,
        Permission.MARKET_ANALYSIS_ADVANCED
      ]);

      expect(rbacClient.canAccessFeature('advanced-simulation')).toBe(true);
      expect(rbacClient.canAccessFeature('advanced-market-analysis')).toBe(true);

      rbacClient.setUserPermissions(UserRole.STANDARD, [Permission.SIMULATE_BASIC]);
      expect(rbacClient.canAccessFeature('advanced-simulation')).toBe(false);
    });

    it('未定義の機能はデフォルトで許可されること', () => {
      rbacClient.setUserPermissions(UserRole.GUEST, []);
      expect(rbacClient.canAccessFeature('undefined-feature')).toBe(true);
    });
  });

  describe('権限不足メッセージ', () => {
    it('未ログイン時のメッセージ', () => {
      rbacClient.clearPermissions();
      expect(rbacClient.getPermissionDeniedMessage()).toBe('ログインが必要です');
    });

    it('ゲストユーザーのメッセージ', () => {
      rbacClient.setUserPermissions(UserRole.GUEST, []);
      expect(rbacClient.getPermissionDeniedMessage()).toBe(
        'この機能を利用するにはアカウント登録が必要です'
      );
    });

    it('標準ユーザーがプレミアム機能にアクセス時のメッセージ', () => {
      rbacClient.setUserPermissions(UserRole.STANDARD, []);
      expect(rbacClient.getPermissionDeniedMessage(Permission.SIMULATE_ADVANCED)).toBe(
        'この機能はプレミアムプラン以上で利用可能です'
      );
    });

    it('その他の権限不足メッセージ', () => {
      rbacClient.setUserPermissions(UserRole.STANDARD, []);
      expect(rbacClient.getPermissionDeniedMessage(Permission.USER_MANAGE)).toBe(
        'この操作を実行する権限がありません'
      );
    });
  });
});