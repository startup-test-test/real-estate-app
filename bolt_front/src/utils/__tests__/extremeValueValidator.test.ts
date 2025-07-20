import { describe, it, expect } from 'vitest'
import {
  validateExtremeValue,
  preprocessExtremeInput,
  validateFieldCombinations
} from '../extremeValueValidator'

describe('extremeValueValidator - SEC-013 極端な値の検証', () => {
  describe('validateExtremeValue', () => {
    describe('価格フィールドの検証', () => {
      it('正常な価格を受け入れる', () => {
        const testCases = [
          { value: 10000000, expected: 10000000 },      // 1000万円
          { value: '50000000', expected: 50000000 },    // 5000万円
          { value: 1000000000, expected: 1000000000 },  // 10億円
        ]
        
        testCases.forEach(({ value, expected }) => {
          const result = validateExtremeValue(value, 'price')
          expect(result.isValid).toBe(true)
          expect(result.sanitizedValue).toBe(expected)
        })
      })

      it('極端に大きい価格を拒否する', () => {
        const testCases = [
          10000000001,                    // 100億円超
          '999999999999999',              // 極端に大きい値
          Number.MAX_SAFE_INTEGER,        // JavaScript最大安全整数
          '1e15',                         // 科学記法での巨大値
        ]
        
        testCases.forEach((value) => {
          const result = validateExtremeValue(value, 'price')
          expect(result.isValid).toBe(false)
          expect(result.message).toBeTruthy()
        })
      })

      it('極端に小さい価格を拒否する', () => {
        const testCases = [
          99999,      // 10万円未満
          0,          // 0円
          -1000000,   // 負の値
        ]
        
        testCases.forEach((value) => {
          const result = validateExtremeValue(value, 'price')
          expect(result.isValid).toBe(false)
          expect(result.message).toBeTruthy()
        })
      })
    })

    describe('パーセンテージフィールドの検証', () => {
      it('正常なパーセンテージを受け入れる', () => {
        const testCases = [
          { value: 0, expected: 0 },
          { value: 50, expected: 50 },
          { value: 99.99, expected: 99.99 },
          { value: 100, expected: 100 },
        ]
        
        testCases.forEach(({ value, expected }) => {
          const result = validateExtremeValue(value, 'percentage')
          expect(result.isValid).toBe(true)
          expect(result.sanitizedValue).toBe(expected)
        })
      })

      it('範囲外のパーセンテージを拒否する', () => {
        const testCases = [
          -1,         // 負のパーセンテージ
          101,        // 100%超
          1000,       // 極端に大きい値
          -100,       // 極端に小さい値
        ]
        
        testCases.forEach((value) => {
          const result = validateExtremeValue(value, 'percentage')
          expect(result.isValid).toBe(false)
          expect(result.message).toContain('0%から100%')
        })
      })
    })

    describe('特殊な値の検出', () => {
      it('無限大を拒否する', () => {
        const testCases = [
          'Infinity',
          '-Infinity',
          'infinity',
          Number.POSITIVE_INFINITY,
          Number.NEGATIVE_INFINITY,
        ]
        
        testCases.forEach((value) => {
          const result = validateExtremeValue(value, 'general')
          expect(result.isValid).toBe(false)
        })
      })

      it('NaNを拒否する', () => {
        const testCases = [
          'NaN',
          'nan',
          NaN,
          Number.NaN,
        ]
        
        testCases.forEach((value) => {
          const result = validateExtremeValue(value, 'general')
          expect(result.isValid).toBe(false)
        })
      })

      it('科学記法の極端な値を拒否する', () => {
        const testCases = [
          '1e100',    // 10の100乗
          '9e15',     // 9000兆
          '-1e20',    // 負の巨大値
        ]
        
        testCases.forEach((value) => {
          const result = validateExtremeValue(value, 'price')
          expect(result.isValid).toBe(false)
          expect(result.message).toContain('科学記法')
        })
      })

      it('16進数、8進数、2進数を拒否する', () => {
        const testCases = [
          '0xFF',     // 16進数
          '0xff',     // 16進数（小文字）
          '0b1111',   // 2進数
          '0o777',    // 8進数
        ]
        
        testCases.forEach((value) => {
          const result = validateExtremeValue(value, 'general')
          expect(result.isValid).toBe(false)
          expect(result.message).toContain('16進数、8進数、2進数')
        })
      })

      it('同じ数字の連続を拒否する', () => {
        const testCases = [
          '1111111111',      // 1が10桁
          '9999999999999',   // 9が13桁
          '0000000000',      // 0が10桁
        ]
        
        testCases.forEach((value) => {
          const result = validateExtremeValue(value, 'general')
          expect(result.isValid).toBe(false)
          expect(result.message).toContain('同じ数字の連続')
        })
      })

      it('数学定数を拒否する', () => {
        const testCases = [
          Math.PI,      // 円周率
          Math.E,       // ネイピア数
          Math.SQRT2,   // √2
        ]
        
        testCases.forEach((value) => {
          const result = validateExtremeValue(value, 'general')
          expect(result.isValid).toBe(false)
          expect(result.message).toContain('数学定数')
        })
      })
    })

    describe('極端に長い入力の検証', () => {
      it('20文字を超える入力を拒否する', () => {
        const longInput = '1'.repeat(25)
        const result = validateExtremeValue(longInput, 'general')
        expect(result.isValid).toBe(false)
        expect(result.message).toContain('長すぎます')
      })
    })

    describe('空値の処理', () => {
      it('null、undefined、空文字列を許可する', () => {
        const testCases = [null, undefined, '']
        
        testCases.forEach((value) => {
          const result = validateExtremeValue(value, 'general')
          expect(result.isValid).toBe(true)
          expect(result.sanitizedValue).toBe(null)
        })
      })
    })
  })

  describe('preprocessExtremeInput', () => {
    it('全角数字を半角に変換する', () => {
      expect(preprocessExtremeInput('１２３４５')).toBe('12345')
    })

    it('カンマを除去する', () => {
      expect(preprocessExtremeInput('1,000,000')).toBe('1000000')
    })

    it('余分な空白を除去する', () => {
      expect(preprocessExtremeInput('  123  ')).toBe('123')
    })

    it('複数の小数点を修正する', () => {
      expect(preprocessExtremeInput('12.34.56')).toBe('12.3456')
    })

    it('先頭の0を除去する（0.xxxを除く）', () => {
      expect(preprocessExtremeInput('0001234')).toBe('1234')
      expect(preprocessExtremeInput('0.1234')).toBe('0.1234')
    })
  })

  describe('validateFieldCombinations', () => {
    it('正常な組み合わせを受け入れる', () => {
      const fields = {
        purchasePrice: 50000000,  // 5000万円
        monthlyRent: 200000,      // 20万円
        landArea: 100,            // 100㎡
        buildingArea: 200,        // 200㎡
        loanAmount: 40000000,     // 4000万円
      }
      
      const result = validateFieldCombinations(fields)
      expect(result.isValid).toBe(true)
      expect(result.messages).toHaveLength(0)
    })

    it('極端に高い利回りを検出する', () => {
      const fields = {
        purchasePrice: 1000000,   // 100万円
        monthlyRent: 500000,      // 50万円（年間600万円）
      }
      
      const result = validateFieldCombinations(fields)
      expect(result.isValid).toBe(false)
      expect(result.messages[0]).toContain('利回りが50%を超えています')
    })

    it('極端に低い利回りを検出する', () => {
      const fields = {
        purchasePrice: 100000000,  // 1億円
        monthlyRent: 5000,         // 5千円（年間6万円）
      }
      
      const result = validateFieldCombinations(fields)
      expect(result.isValid).toBe(false)
      expect(result.messages[0]).toContain('利回りが0.1%未満です')
    })

    it('極端な容積率を検出する', () => {
      const fields = {
        landArea: 10,          // 10㎡
        buildingArea: 250,     // 250㎡（容積率2500%）
      }
      
      const result = validateFieldCombinations(fields)
      expect(result.isValid).toBe(false)
      expect(result.messages[0]).toContain('容積率が2000%を超えています')
    })

    it('LTVが100%を超える場合を検出する', () => {
      const fields = {
        purchasePrice: 50000000,  // 5000万円
        loanAmount: 60000000,     // 6000万円
      }
      
      const result = validateFieldCombinations(fields)
      expect(result.isValid).toBe(false)
      expect(result.messages[0]).toContain('借入額が購入価格を超えています')
    })

    it('極端な㎡単価を検出する', () => {
      // 高すぎる単価
      const highPriceFields = {
        purchasePrice: 1000000000,  // 10億円
        landArea: 10,               // 10㎡（1億円/㎡）
      }
      
      let result = validateFieldCombinations(highPriceFields)
      expect(result.isValid).toBe(false)
      expect(result.messages[0]).toContain('㎡単価が極端に高い')

      // 低すぎる単価
      const lowPriceFields = {
        purchasePrice: 10000,      // 1万円
        landArea: 100,             // 100㎡（100円/㎡）
      }
      
      result = validateFieldCombinations(lowPriceFields)
      expect(result.isValid).toBe(false)
      expect(result.messages[0]).toContain('㎡単価が極端に低い')
    })

    it('複数の問題を検出する', () => {
      const fields = {
        purchasePrice: 1000000,   // 100万円
        monthlyRent: 500000,      // 50万円
        loanAmount: 2000000,      // 200万円（LTV 200%）
        landArea: 10,
        buildingArea: 300,        // 容積率3000%
      }
      
      const result = validateFieldCombinations(fields)
      expect(result.isValid).toBe(false)
      expect(result.messages.length).toBeGreaterThan(1)
    })
  })
})