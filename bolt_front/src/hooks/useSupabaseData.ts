import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Property, Simulation, MarketAnalysis } from '../types'

export function useSupabaseData() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Properties CRUD operations
  const saveProperty = async (propertyData: Omit<Property, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('properties')
        .insert({
          ...propertyData,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const getProperties = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const deleteProperty = async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Simulations CRUD operations
  const saveSimulation = async (simulationData: any, shareToken?: string, existingId?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // 認証されていない場合はローカルでシミュレーションデータを処理
      if (!user) {
        console.log('🧪 User not authenticated, returning local simulation data');
        const localSimulation = {
          id: existingId || crypto.randomUUID(),
          simulation_name: simulationData.simulation_name,
          input_data: simulationData.input_data,
          result_data: simulationData.result_data,
          user_id: 'anonymous',
          share_token: shareToken || crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return { data: localSimulation, error: null };
      }

      // ユーザーが public.users テーブルに存在するか確認
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      // ユーザーが存在しない場合は作成
      if (userCheckError || !existingUser) {
        console.log('Creating user in public.users table...')
        const { error: userCreateError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || ''
          })
        
        if (userCreateError) {
          console.log('User creation error (might already exist):', userCreateError)
        }
      }

      // シミュレーションデータを準備（share_tokenは除外）
      const dataToSave = {
        ...simulationData,
        user_id: user.id,
      };
      
      // property_idが無効な場合はNULLに設定
      if (dataToSave.property_id && typeof dataToSave.property_id === 'string' && dataToSave.property_id.trim() === '') {
        dataToSave.property_id = null;
      }
      
      console.log('💾 Saving simulation data:', { 
        hasPropertyId: !!dataToSave.property_id, 
        hasShareToken: !!shareToken 
      });

      let data, error;

      // 編集モード（既存IDがある場合）は更新処理
      if (existingId) {
        console.log('🔄 Updating existing simulation:', existingId);
        
        // まず既存レコードの存在確認
        const { data: existingRecord, error: checkError } = await supabase
          .from('simulations')
          .select('id, user_id')
          .eq('id', existingId)
          .single();

        if (checkError || !existingRecord) {
          console.warn('⚠️ 更新対象のシミュレーションが見つかりません:', existingId);
          // 見つからない場合は新規作成として処理
          const insertResult = await supabase
            .from('simulations')
            .insert(dataToSave)
            .select()
            .single();
          
          data = insertResult.data;
          error = insertResult.error;
        } else if (existingRecord.user_id !== user.id) {
          console.warn('⚠️ 他のユーザーのシミュレーションは更新できません');
          return { data: null, error: 'アクセス権限がありません' };
        } else {
          // 更新処理
          const updateResult = await supabase
            .from('simulations')
            .update({
              ...dataToSave,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingId)
            .select()
            .single();
          
          data = updateResult.data;
          error = updateResult.error;
        }
      } else {
        // 新規作成
        console.log('📝 Creating new simulation');
        const insertResult = await supabase
          .from('simulations')
          .insert(dataToSave)
          .select()
          .single();
          
        data = insertResult.data;
        error = insertResult.error;
      }

      if (error) {
        console.error('Simulation save error:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }
      
      console.log('Simulation saved successfully:', data)
      
      // シミュレーション保存成功後、share_tokenがある場合は別途保存
      if (shareToken && data) {
        try {
          console.log('💾 Saving share token separately...')
          const { error: shareError } = await supabase
            .from('simulations')
            .update({ share_token: shareToken })
            .eq('id', data.id)
            .eq('user_id', user.id)
          
          if (shareError) {
            console.warn('Share token save failed (non-critical):', shareError)
          } else {
            console.log('✅ Share token saved successfully')
          }
        } catch (shareErr) {
          console.warn('Share token save error (non-critical):', shareErr)
        }
      }
      
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Save simulation error:', err)
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const getSimulations = async (propertyId?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      let query = supabase
        .from('simulations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (propertyId) {
        query = query.eq('property_id', propertyId)
      }

      const { data, error } = await query

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const deleteSimulation = async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase
        .from('simulations')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Market Analysis CRUD operations
  const saveMarketAnalysis = async (analysisData: Omit<MarketAnalysis, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('market_analyses')
        .insert({
          ...analysisData,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const getMarketAnalyses = async (propertyId?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      let query = supabase
        .from('market_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (propertyId) {
        query = query.eq('property_id', propertyId)
      }

      const { data, error } = await query

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    // Properties
    saveProperty,
    getProperties,
    updateProperty,
    deleteProperty,
    // Simulations
    saveSimulation,
    getSimulations,
    deleteSimulation,
    // Market Analyses
    saveMarketAnalysis,
    getMarketAnalyses,
  }
}