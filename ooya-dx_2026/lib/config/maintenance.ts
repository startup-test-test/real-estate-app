/**
 * メンテナンスモード設定
 *
 * 本番環境でメンテナンス画面を表示する場合は、
 * isMaintenanceMode を true に変更してください。
 */

export const maintenanceConfig = {
  // メンテナンスモードのON/OFF
  // true: メンテナンス画面を表示
  // false: 通常のサービスを表示
  isMaintenanceMode: false,

  // メンテナンス情報
  maintenanceInfo: {
    startDate: '2025年10月29日 00:00',
    endDate: '未定（完了次第お知らせいたします）',
    message: 'システムメンテナンスを実施しております。',
  },
};

/**
 * メンテナンスモードかどうかを判定
 */
export const isMaintenanceMode = (): boolean => {
  return maintenanceConfig.isMaintenanceMode;
};
