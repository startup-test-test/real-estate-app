import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CancelSubscriptionModal from '../CancelSubscriptionModal';

describe('CancelSubscriptionModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    cancelDate: '2025年8月20日',
    remainingDays: 7,
    isLoading: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('表示/非表示', () => {
    it('isOpen=trueの時モーダルが表示される', () => {
      render(<CancelSubscriptionModal {...defaultProps} />);
      expect(screen.getByText('プランを解約しますか？')).toBeInTheDocument();
    });

    it('isOpen=falseの時モーダルが表示されない', () => {
      render(<CancelSubscriptionModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('プランを解約しますか？')).not.toBeInTheDocument();
    });
  });

  describe('コンテンツ表示', () => {
    it('解約日が正しく表示される', () => {
      render(<CancelSubscriptionModal {...defaultProps} />);
      expect(screen.getByText(/2025年8月20日まで全機能をご利用いただけます/)).toBeInTheDocument();
    });

    it('残日数が正しく表示される', () => {
      render(<CancelSubscriptionModal {...defaultProps} />);
      expect(screen.getByText(/残り7日間は無制限で利用可能です/)).toBeInTheDocument();
    });

    it('警告メッセージが表示される', () => {
      render(<CancelSubscriptionModal {...defaultProps} />);
      expect(screen.getByText('解約にあたってのご注意')).toBeInTheDocument();
      expect(screen.getByText('日割り返金はございません')).toBeInTheDocument();
      expect(screen.getByText('解約後は月5回の利用制限に戻ります')).toBeInTheDocument();
    });

    it('サポート情報が表示される', () => {
      render(<CancelSubscriptionModal {...defaultProps} />);
      expect(screen.getByText(/ooya.tech2025@gmail.com/)).toBeInTheDocument();
    });
  });

  describe('ユーザーインタラクション', () => {
    it('キャンセルボタンクリックでonCloseが呼ばれる', () => {
      render(<CancelSubscriptionModal {...defaultProps} />);
      const cancelButton = screen.getByText('キャンセル');
      fireEvent.click(cancelButton);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('解約するボタンクリックでonConfirmが呼ばれる', () => {
      render(<CancelSubscriptionModal {...defaultProps} />);
      const confirmButton = screen.getByText('解約する');
      fireEvent.click(confirmButton);
      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });

    it('XボタンクリックでonCloseが呼ばれる', () => {
      render(<CancelSubscriptionModal {...defaultProps} />);
      const closeButton = screen.getByLabelText('閉じる');
      fireEvent.click(closeButton);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('背景クリックでonCloseが呼ばれる', () => {
      render(<CancelSubscriptionModal {...defaultProps} />);
      const backdrop = screen.getByText('プランを解約しますか？').closest('.fixed.inset-0');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('ローディング状態', () => {
    it('ローディング中はボタンが無効化される', () => {
      render(<CancelSubscriptionModal {...defaultProps} isLoading={true} />);
      const cancelButton = screen.getByText('キャンセル');
      const confirmButton = screen.getByText('処理中...');
      
      expect(cancelButton).toBeDisabled();
      expect(confirmButton.closest('button')).toBeDisabled();
    });

    it('ローディング中は処理中テキストが表示される', () => {
      render(<CancelSubscriptionModal {...defaultProps} isLoading={true} />);
      expect(screen.getByText('処理中...')).toBeInTheDocument();
    });

    it('ローディング中は閉じるボタンが無効化される', () => {
      render(<CancelSubscriptionModal {...defaultProps} isLoading={true} />);
      const closeButton = screen.getByLabelText('閉じる');
      expect(closeButton).toBeDisabled();
    });

    it('ローディング中は背景クリックが無効', () => {
      render(<CancelSubscriptionModal {...defaultProps} isLoading={true} />);
      const backdrop = screen.getByText('プランを解約しますか？').closest('.fixed.inset-0');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(defaultProps.onClose).not.toHaveBeenCalled();
      }
    });
  });

  describe('ESCキー処理', () => {
    it('ESCキーでモーダルが閉じる', () => {
      render(<CancelSubscriptionModal {...defaultProps} />);
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('ローディング中はESCキーが無効', () => {
      render(<CancelSubscriptionModal {...defaultProps} isLoading={true} />);
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  describe('エッジケース', () => {
    it('残日数が0の場合の表示', () => {
      render(<CancelSubscriptionModal {...defaultProps} remainingDays={0} />);
      expect(screen.getByText(/残り0日間は無制限で利用可能です/)).toBeInTheDocument();
    });

    it('残日数が30日の場合の表示', () => {
      render(<CancelSubscriptionModal {...defaultProps} remainingDays={30} />);
      expect(screen.getByText(/残り30日間は無制限で利用可能です/)).toBeInTheDocument();
    });

    it('長い解約日付の表示', () => {
      const longDate = '2025年12月31日';
      render(<CancelSubscriptionModal {...defaultProps} cancelDate={longDate} />);
      expect(screen.getByText(new RegExp(longDate))).toBeInTheDocument();
    });
  });
});