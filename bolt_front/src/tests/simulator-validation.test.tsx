import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { validateSimulatorInputs } from '../utils/securityValidation';

describe('シミュレーター入力バリデーションテスト', () => {
  describe('正常系テストケース', () => {
    it('NORMAL_001: 最小値での正常動作', () => {
      const input = {
        propertyName: 'テスト物件',
        location: '東京都',
        yearBuilt: 1950,
        propertyType: '木造',
        purchasePrice: 100,
        surfaceYield: 0.1,
        monthlyRent: 10000
      };
      
      const result = validateSimulatorInputs(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('NORMAL_002: 最大値での正常動作', () => {
      const input = {
        propertyName: '高級タワーマンション',
        location: '東京都港区',
        yearBuilt: 2025,
        propertyType: 'RC',
        purchasePrice: 100000,
        surfaceYield: 20,
        monthlyRent: 10000000,
        loanAmount: 80000,
        interestRate: 10,
        loanPeriod: 50
      };
      
      const result = validateSimulatorInputs(input);
      expect(result.isValid).toBe(true);
      // 警告はあってもよい
      if (result.warnings) {
        expect(result.warnings.length).toBeGreaterThan(0);
      }
    });

    it('NORMAL_003: 一般的な投資物件', () => {
      const input = {
        propertyName: '新宿区ワンルーム',
        location: '東京都新宿区',
        yearBuilt: 2010,
        propertyType: 'RC',
        purchasePrice: 2500,
        surfaceYield: 5.5,
        monthlyRent: 115000,
        managementFee: 5750,
        repairReserve: 8000,
        propertyTax: 80000,
        loanAmount: 2000,
        interestRate: 2.5,
        loanPeriod: 35
      };
      
      const result = validateSimulatorInputs(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('異常系テストケース', () => {
    it('ERROR_001: ゼロ値入力でエラー', () => {
      const input = {
        propertyName: 'ゼロテスト',
        location: 'テスト',
        yearBuilt: 0,
        propertyType: 'RC',
        purchasePrice: 0,
        surfaceYield: 0,
        monthlyRent: 0
      };
      
      const result = validateSimulatorInputs(input);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.fieldErrors.yearBuilt).toBeDefined();
      expect(result.fieldErrors.purchasePrice).toBeDefined();
      expect(result.fieldErrors.surfaceYield).toBeDefined();
      expect(result.fieldErrors.monthlyRent).toBeDefined();
    });

    it('ERROR_002: マイナス値入力でエラー', () => {
      const input = {
        propertyName: 'マイナステスト',
        location: 'テスト',
        yearBuilt: -2020,
        propertyType: 'RC',
        purchasePrice: -5000,
        surfaceYield: -10,
        monthlyRent: -100000
      };
      
      const result = validateSimulatorInputs(input);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.fieldErrors.yearBuilt).toContain('正の数');
      expect(result.fieldErrors.purchasePrice).toContain('0より大きい');
    });

    it('ERROR_003: 極端な値でエラーまたは警告', () => {
      const input = {
        propertyName: '極端テスト',
        location: 'テスト',
        yearBuilt: 999999999,
        propertyType: 'RC',
        purchasePrice: 999999999,
        surfaceYield: 999,
        monthlyRent: 999999999999
      };
      
      const result = validateSimulatorInputs(input);
      // 極端な値は警告またはエラー
      if (result.isValid) {
        expect(result.warnings).toBeDefined();
        expect(result.warnings.length).toBeGreaterThan(0);
      } else {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it('ERROR_004: 空文字・null・undefinedでエラー', () => {
      const input = {
        propertyName: '',
        location: null as any,
        yearBuilt: undefined as any,
        propertyType: '',
        purchasePrice: '',
        surfaceYield: null as any,
        monthlyRent: ''
      };
      
      const result = validateSimulatorInputs(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('物件名を入力してください');
      expect(result.errors).toContain('所在地を入力してください');
      expect(result.errors).toContain('建築年を入力してください');
    });
  });

  describe('境界値テストケース', () => {
    describe('BOUNDARY_001: 建築年の境界値', () => {
      it('1900年は正常処理', () => {
        const input = {
          propertyName: 'テスト',
          location: 'テスト',
          yearBuilt: 1900,
          propertyType: 'RC',
          purchasePrice: 1000,
          surfaceYield: 5,
          monthlyRent: 50000
        };
        
        const result = validateSimulatorInputs(input);
        expect(result.isValid).toBe(true);
      });

      it('1899年は警告またはエラー', () => {
        const input = {
          propertyName: 'テスト',
          location: 'テスト',
          yearBuilt: 1899,
          propertyType: 'RC',
          purchasePrice: 1000,
          surfaceYield: 5,
          monthlyRent: 50000
        };
        
        const result = validateSimulatorInputs(input);
        if (result.isValid) {
          expect(result.warnings).toBeDefined();
        } else {
          expect(result.fieldErrors.yearBuilt).toBeDefined();
        }
      });

      it('現在年は正常処理', () => {
        const currentYear = new Date().getFullYear();
        const input = {
          propertyName: 'テスト',
          location: 'テスト',
          yearBuilt: currentYear,
          propertyType: 'RC',
          purchasePrice: 1000,
          surfaceYield: 5,
          monthlyRent: 50000
        };
        
        const result = validateSimulatorInputs(input);
        expect(result.isValid).toBe(true);
      });

      it('未来の年はエラー', () => {
        const futureYear = new Date().getFullYear() + 1;
        const input = {
          propertyName: 'テスト',
          location: 'テスト',
          yearBuilt: futureYear,
          propertyType: 'RC',
          purchasePrice: 1000,
          surfaceYield: 5,
          monthlyRent: 50000
        };
        
        const result = validateSimulatorInputs(input);
        expect(result.isValid).toBe(false);
        expect(result.fieldErrors.yearBuilt).toContain('未来');
      });
    });

    describe('BOUNDARY_002: 表面利回りの境界値', () => {
      it('0.01%は正常（低利回り警告）', () => {
        const input = {
          propertyName: 'テスト',
          location: 'テスト',
          yearBuilt: 2020,
          propertyType: 'RC',
          purchasePrice: 1000,
          surfaceYield: 0.01,
          monthlyRent: 50000
        };
        
        const result = validateSimulatorInputs(input);
        expect(result.isValid).toBe(true);
        if (result.warnings) {
          expect(result.warnings).toContain('利回りが低すぎます');
        }
      });

      it('0%はエラー', () => {
        const input = {
          propertyName: 'テスト',
          location: 'テスト',
          yearBuilt: 2020,
          propertyType: 'RC',
          purchasePrice: 1000,
          surfaceYield: 0,
          monthlyRent: 50000
        };
        
        const result = validateSimulatorInputs(input);
        expect(result.isValid).toBe(false);
        expect(result.fieldErrors.surfaceYield).toBeDefined();
      });

      it('30%は正常または警告', () => {
        const input = {
          propertyName: 'テスト',
          location: 'テスト',
          yearBuilt: 2020,
          propertyType: 'RC',
          purchasePrice: 1000,
          surfaceYield: 30,
          monthlyRent: 250000
        };
        
        const result = validateSimulatorInputs(input);
        expect(result.isValid).toBe(true);
        if (result.warnings) {
          expect(result.warnings).toContain('利回りが高すぎます');
        }
      });

      it('100%はエラーまたは強い警告', () => {
        const input = {
          propertyName: 'テスト',
          location: 'テスト',
          yearBuilt: 2020,
          propertyType: 'RC',
          purchasePrice: 1000,
          surfaceYield: 100,
          monthlyRent: 1000000
        };
        
        const result = validateSimulatorInputs(input);
        if (result.isValid) {
          expect(result.warnings).toBeDefined();
          expect(result.warnings).toContain('非現実的');
        } else {
          expect(result.fieldErrors.surfaceYield).toBeDefined();
        }
      });
    });

    describe('BOUNDARY_003: ローン条件の境界値', () => {
      it('ローン期間1年は正常', () => {
        const input = {
          propertyName: 'テスト',
          location: 'テスト',
          yearBuilt: 2020,
          propertyType: 'RC',
          purchasePrice: 1000,
          surfaceYield: 5,
          monthlyRent: 50000,
          loanAmount: 800,
          loanPeriod: 1,
          interestRate: 2
        };
        
        const result = validateSimulatorInputs(input);
        expect(result.isValid).toBe(true);
      });

      it('ローン期間0年は現金購入として処理', () => {
        const input = {
          propertyName: 'テスト',
          location: 'テスト',
          yearBuilt: 2020,
          propertyType: 'RC',
          purchasePrice: 1000,
          surfaceYield: 5,
          monthlyRent: 50000,
          loanAmount: 0,
          loanPeriod: 0,
          interestRate: 0
        };
        
        const result = validateSimulatorInputs(input);
        expect(result.isValid).toBe(true);
      });

      it('ローン期間50年は正常または警告', () => {
        const input = {
          propertyName: 'テスト',
          location: 'テスト',
          yearBuilt: 2020,
          propertyType: 'RC',
          purchasePrice: 1000,
          surfaceYield: 5,
          monthlyRent: 50000,
          loanAmount: 800,
          loanPeriod: 50,
          interestRate: 2
        };
        
        const result = validateSimulatorInputs(input);
        expect(result.isValid).toBe(true);
        if (result.warnings) {
          expect(result.warnings).toContain('ローン期間が長い');
        }
      });

      it('金利20%は警告', () => {
        const input = {
          propertyName: 'テスト',
          location: 'テスト',
          yearBuilt: 2020,
          propertyType: 'RC',
          purchasePrice: 1000,
          surfaceYield: 5,
          monthlyRent: 50000,
          loanAmount: 800,
          loanPeriod: 20,
          interestRate: 20
        };
        
        const result = validateSimulatorInputs(input);
        expect(result.isValid).toBe(true);
        expect(result.warnings).toContain('金利が高い');
      });
    });
  });

  describe('セキュリティテストケース', () => {
    it('SECURITY_001: SQLインジェクション対策', () => {
      const input = {
        propertyName: "'; DROP TABLE users; --",
        location: "' OR '1'='1",
        yearBuilt: 2020,
        propertyType: 'RC',
        purchasePrice: 1000,
        surfaceYield: 5,
        monthlyRent: 50000
      };
      
      const result = validateSimulatorInputs(input);
      // SQLインジェクション文字列はサニタイズされる
      expect(result.sanitizedData).toBeDefined();
      expect(result.sanitizedData.propertyName).not.toContain('DROP TABLE');
    });

    it('SECURITY_002: XSS対策', () => {
      const input = {
        propertyName: "<script>alert('XSS')</script>",
        location: "<img src=x onerror=alert('XSS')>",
        yearBuilt: 2020,
        propertyType: 'RC',
        purchasePrice: 1000,
        surfaceYield: 5,
        monthlyRent: 50000
      };
      
      const result = validateSimulatorInputs(input);
      // スクリプトタグはエスケープされる
      expect(result.sanitizedData).toBeDefined();
      expect(result.sanitizedData.propertyName).not.toContain('<script>');
      expect(result.sanitizedData.location).not.toContain('<img');
    });

    it('SECURITY_003: 巨大データ制限', () => {
      const input = {
        propertyName: 'A'.repeat(10000),
        location: 'B'.repeat(100000),
        yearBuilt: 2020,
        propertyType: 'RC',
        purchasePrice: 1000,
        surfaceYield: 5,
        monthlyRent: 50000
      };
      
      const result = validateSimulatorInputs(input);
      // 文字数制限でエラーまたは切り捨て
      if (result.isValid) {
        expect(result.sanitizedData.propertyName.length).toBeLessThanOrEqual(255);
        expect(result.sanitizedData.location.length).toBeLessThanOrEqual(255);
      } else {
        expect(result.fieldErrors.propertyName).toContain('文字数');
      }
    });
  });
});