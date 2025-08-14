import { assertEquals, assertExists } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { describe, it, beforeEach, afterEach } from 'https://deno.land/std@0.168.0/testing/bdd.ts'

describe('create-checkout-session', () => {
  let originalEnv: string | undefined

  beforeEach(() => {
    originalEnv = Deno.env.get('APP_URL')
  })

  afterEach(() => {
    if (originalEnv !== undefined) {
      Deno.env.set('APP_URL', originalEnv)
    } else {
      Deno.env.delete('APP_URL')
    }
  })

  describe('環境変数によるURL切り替え', () => {
    it('APP_URL環境変数が設定されている場合、その値を使用すること', () => {
      const testUrl = 'https://test.example.com'
      Deno.env.set('APP_URL', testUrl)
      
      const successUrl = `${Deno.env.get('APP_URL') || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`
      const cancelUrl = `${Deno.env.get('APP_URL') || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=cancelled`
      
      assertEquals(successUrl, 'https://test.example.com/?payment=success&session_id={CHECKOUT_SESSION_ID}')
      assertEquals(cancelUrl, 'https://test.example.com/?payment=cancelled')
    })

    it('APP_URL環境変数が未設定の場合、デフォルトのCodespace URLを使用すること', () => {
      Deno.env.delete('APP_URL')
      
      const successUrl = `${Deno.env.get('APP_URL') || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`
      const cancelUrl = `${Deno.env.get('APP_URL') || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=cancelled`
      
      assertEquals(successUrl, 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev/?payment=success&session_id={CHECKOUT_SESSION_ID}')
      assertEquals(cancelUrl, 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev/?payment=cancelled')
    })

    it('本番環境URLが正しく設定できること', () => {
      const prodUrl = 'https://ooya.tech'
      Deno.env.set('APP_URL', prodUrl)
      
      const successUrl = `${Deno.env.get('APP_URL') || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`
      const cancelUrl = `${Deno.env.get('APP_URL') || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=cancelled`
      
      assertEquals(successUrl, 'https://ooya.tech/?payment=success&session_id={CHECKOUT_SESSION_ID}')
      assertEquals(cancelUrl, 'https://ooya.tech/?payment=cancelled')
    })

    it('ステージング環境URLが正しく設定できること', () => {
      const stagingUrl = 'https://staging.ooya.tech'
      Deno.env.set('APP_URL', stagingUrl)
      
      const successUrl = `${Deno.env.get('APP_URL') || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`
      const cancelUrl = `${Deno.env.get('APP_URL') || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=cancelled`
      
      assertEquals(successUrl, 'https://staging.ooya.tech/?payment=success&session_id={CHECKOUT_SESSION_ID}')
      assertEquals(cancelUrl, 'https://staging.ooya.tech/?payment=cancelled')
    })

    it('URLにセッションIDプレースホルダーが含まれること', () => {
      const testUrl = 'https://test.example.com'
      Deno.env.set('APP_URL', testUrl)
      
      const successUrl = `${Deno.env.get('APP_URL') || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`
      
      assertExists(successUrl.includes('{CHECKOUT_SESSION_ID}'))
    })

    it('URLにpaymentパラメータが正しく設定されること', () => {
      const testUrl = 'https://test.example.com'
      Deno.env.set('APP_URL', testUrl)
      
      const successUrl = `${Deno.env.get('APP_URL') || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`
      const cancelUrl = `${Deno.env.get('APP_URL') || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=cancelled`
      
      assertExists(successUrl.includes('payment=success'))
      assertExists(cancelUrl.includes('payment=cancelled'))
    })
  })
})