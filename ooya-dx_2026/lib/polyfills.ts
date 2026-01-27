// crypto.randomUUID() のグローバルポリフィル（古いブラウザ対応）
// 一部のブラウザ（特に古いバージョン）でcrypto.randomUUIDがサポートされていない場合に対応

if (typeof window !== 'undefined') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID !== 'function') {
    // RFC 4122 v4 UUID生成のポリフィル
    (crypto as any).randomUUID = function(): string {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
  }
}

export {};
