// ナビゲーション設定ファイル
// フッターやその他のナビゲーションで使用するリンク一覧を一元管理

export interface NavigationItem {
  name: string;
  description?: string;
  href: string;
  available?: boolean;
  isHeader?: boolean;
  publishDate?: string; // 公開日 (YYYY-MM-DD形式)
  lastUpdated?: string; // 最終更新日 (YYYY-MM-DD形式)
}

export interface ToolCategory {
  id: string;
  title: string;
  description: string;
  items: NavigationItem[];
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

// 賃貸経営シミュレーター
export const simulatorLinks: NavigationItem[] = [
  { name: '賃貸経営シミュレーター', description: 'IRR、CCR、DSCR、キャッシュフロー一括計算', href: '/tools/simulator' },
];

// カテゴリ別計算ツール（投資ライフサイクル順）
export const toolCategories: ToolCategory[] = [
  {
    id: 'entry',
    title: 'Step.1 購入検討（入口）',
    description: '物件購入前の収益性・価格の妥当性を判断するためのツール群です。',
    items: [
      { name: '利回り・収支を調べたい', description: '利回りとCFで物件の収益力を判断', href: '', isHeader: true },
      { name: '表面利回り・実質利回り', description: '物件の利回りを計算', href: '/tools/yield-rate', available: true, publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
      { name: 'キャップレート（還元利回り）', description: '還元利回りを計算・物件価格を逆算', href: '/tools/cap-rate', available: true, publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
      { name: 'CF（キャッシュフロー）', description: '税引前・税引後CFを計算', href: '/tools/cf', available: true, publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
      { name: 'この物件、いくらが妥当？', description: '積算・収益の両面から物件の値段を検証できます', href: '', isHeader: true },
      { name: '収益還元（直接還元法）', description: '直接還元法による価格計算', href: '/tools/income-capitalization', available: true, publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
      { name: 'DCF法（収益価格）', description: '割引キャッシュフロー法による価格計算', href: '/tools/dcf', available: true, publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
      { name: '積算評価', description: '土地・建物の積算価格を計算', href: '/tools/assessed-value', available: true, publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
      { name: '再調達価格', description: '建物の再調達原価を計算', href: '/tools/replacement-cost', available: true, publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
      { name: '購入時にかかる費用・税金を知りたい', description: '物件取得時に発生する手数料や税金を計算できます', href: '', isHeader: true },
      { name: '仲介手数料', description: '売買価格から仲介手数料を計算', href: '/tools/brokerage', available: true, publishDate: '2026-01-15', lastUpdated: '2026-02-05' },
      { name: '不動産取得税', description: '不動産購入時の税金を計算', href: '/tools/acquisition-tax', available: true, publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
      { name: '登録免許税', description: '登記にかかる税金を計算', href: '/tools/registration-tax', available: true, publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
      { name: '印紙税', description: '契約書・領収書の印紙税を計算', href: '/tools/stamp-tax', available: true, publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
      { name: '固定資産税精算金', description: '引渡日で日割り計算する精算金を算出', href: '/tools/property-tax-settlement', available: false },
      { name: '建物消費税按分', description: '売買価格から土地・建物の内訳を計算', href: '/tools/building-tax-split', available: false },
      { name: '融資・ローンを調べたい', description: '返済額・借入限度・レバレッジを試算します', href: '', isHeader: true },
      { name: '住宅ローン', description: '毎月返済額・総返済額を計算', href: '/tools/mortgage-loan', available: true, publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
      { name: 'LTV（借入比率）', description: 'レバレッジの程度を把握', href: '/tools/ltv', available: true, publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
      { name: 'DSCR（債務返済カバー率）', description: '返済余力を計算', href: '/tools/dscr', available: true, publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
      { name: '借入可能額', description: '年収倍率・返済比率から判定', href: '/tools/borrowing-capacity', available: false },
      { name: '収益性を数字で確認したい', description: 'わかりやすい指標で投資の収益性を判断できます', href: '', isHeader: true },
      { name: 'NOI（営業純収益）', description: '経費控除後の純収益を計算', href: '/tools/noi', available: true, publishDate: '2026-01-15', lastUpdated: '2026-01-20' },
      { name: 'ROI（投資利益率）', description: '投資効率をキャッシュフローで評価', href: '/tools/roi', available: true, publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
      { name: 'CCR（自己資金配当率）', description: '自己資金に対する利回りを計算', href: '/tools/ccr', available: true, publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
      { name: '高度な投資分析をしたい', description: '時間価値や割引率を使った上級者向けの分析ツールです', href: '', isHeader: true },
      { name: 'IRR（内部収益率）', description: '投資の収益性を時間価値で評価', href: '/tools/irr', available: true, publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
      { name: 'NPV（正味現在価値）', description: 'DCF法による投資価値の評価', href: '/tools/npv', available: true, publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
    ],
  },
  {
    id: 'management',
    title: 'Step.2 運営・節税（保有）',
    description: '賃貸経営中の収支管理と節税対策に活用できるツールです。',
    items: [
      { name: '将来のリスクに備えたい', description: '減価償却切れによる「黒字倒産」リスクを予測します', href: '', isHeader: true },
      { name: 'デッドクロス', description: '減価償却と元金返済の逆転時期を予測', href: '/tools/dead-cross', available: true, publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
      { name: '繰上返済', description: '繰上返済のメリットを計算', href: '/tools/prepayment', available: false },
      { name: 'リフォーム費用', description: 'リフォーム費用を概算', href: '/tools/renovation-cost', available: false },
      { name: 'リフォームローン', description: 'リフォームローンの返済を計算', href: '/tools/renovation-loan', available: false },
      { name: '毎年かかる税金・経費を把握したい', description: '保有中に発生する税金や経費を計算できます', href: '', isHeader: true },
      { name: '固定資産税', description: '毎年かかる固定資産税を計算', href: '/tools/property-tax', available: false },
      { name: '減価償却', description: '建物の年間減価償却費を計算', href: '/tools/depreciation', available: true, publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
      { name: '法人税', description: '不動産法人の税金を計算', href: '/tools/corporate-tax', available: true, publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
      { name: '所得税・住民税（個人）', description: '給与と不動産所得を合算した税額を計算', href: '/tools/income-tax', available: false },
      { name: '個人事業税', description: '5棟10室以上で発生する事業税を計算', href: '/tools/business-tax', available: false },
    ],
  },
  {
    id: 'exit',
    title: 'Step.3 出口・売却',
    description: '出口戦略に必要な手取り額・税金・費用をまとめて試算します。',
    items: [
      { name: '売ったらいくら残るか知りたい', description: '諸費用・税金を差し引いた最終手取り額を計算します', href: '', isHeader: true },
      { name: '売却手取り', description: '税引き後の手取り額を計算', href: '/tools/sale-proceeds', available: true, publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
      { name: '売却にかかる税金・費用を知りたい', description: '売却時に発生する税金や仲介手数料を計算できます', href: '', isHeader: true },
      { name: '譲渡所得税', description: '不動産売却時の所得税・住民税を計算', href: '/tools/capital-gains-tax', available: true, publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
      { name: '仲介手数料', description: '売買価格から仲介手数料を計算', href: '/tools/brokerage', available: true, publishDate: '2026-01-15', lastUpdated: '2026-02-05' },
      { name: '印紙税', description: '契約書・領収書の印紙税を計算', href: '/tools/stamp-tax', available: true, publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
      { name: '家族に不動産を渡したい', description: '贈与・相続それぞれの税負担を比較できます', href: '', isHeader: true },
      { name: '贈与税', description: '不動産贈与時の税金を計算', href: '/tools/gift-tax', available: true, publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
      { name: '相続税', description: '遺産相続時の税金を計算', href: '/tools/inheritance-tax', available: true, publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
    ],
  },
];

// ツール情報を取得するヘルパー関数
export function getToolInfo(href: string): NavigationItem | undefined {
  for (const category of toolCategories) {
    const tool = category.items.find(item => item.href === href);
    if (tool) return tool;
  }
  return undefined;
}

// 日付フォーマット用ヘルパー関数
export function formatToolDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// 全ての計算ツール（フラットなリスト・重複除去）- 後方互換性のため維持
export const calculatorTools: NavigationItem[] = toolCategories
  .flatMap(category => category.items)
  .filter((item, index, arr) => !item.isHeader && arr.findIndex(i => i.href === item.href) === index);

// 利用可能なツールのみ
export const availableTools: NavigationItem[] = calculatorTools.filter(tool => tool.available);

// メディア・その他
export const otherLinks: NavigationItem[] = [
  { name: 'メディア', description: '不動産投資の基礎知識', href: '/media' },
];

// 会社関連（フッター表示用）
export const companyLinks: NavigationItem[] = [
  { name: '会社概要', href: '/company', publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
  { name: '実績・得意領域', href: '/company/portfolio', publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
  { name: 'メニュー・料金', href: '/company/service', publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
  { name: '自己紹介', href: '/profile', publishDate: '2026-01-15', lastUpdated: '2026-02-16' },
  { name: 'お問合わせ', href: '/company/contact', publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
];

// 会社関連ページ全て（日付管理用）
export const allCompanyPages: NavigationItem[] = [
  ...companyLinks,
  { name: 'CSR', href: '/company/csr', publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
  { name: 'SDGs', href: '/company/sdgs', publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
  { name: '気候変動への対応', href: '/company/climate-adaptation', publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
  { name: 'プラスチックスマート', href: '/company/plastics-smart', publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
  { name: '消費者志向自主宣言', href: '/company/consumer-policy', publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
  { name: 'チームビヨンド', href: '/company/teambeyond', publishDate: '2026-01-15', lastUpdated: '2026-02-05' },
  { name: 'ライブラリパートナー', href: '/company/lib-partner', publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
  { name: 'リンク', href: '/company/link', publishDate: '2026-01-15', lastUpdated: '2026-02-05' },
];

// 会社ページ情報を取得するヘルパー関数
export function getCompanyPageInfo(href: string): NavigationItem | undefined {
  return allCompanyPages.find(item => item.href === href);
}

// 会社関連 + 賃貸経営クラウドサービス（同一カラム内）
export const companyAndCloudLinks: NavigationItem[] = [
  ...companyLinks,
  { name: '賃貸経営クラウドサービス', href: '', isHeader: true },
  ...simulatorLinks,
];

// フッターナビゲーションセクション
export const footerNavigation: NavigationSection[] = [
  {
    title: '会社関連',
    items: companyAndCloudLinks,
  },
  {
    title: '賃貸経営計算ツール',
    items: availableTools,
  },
  {
    title: 'メディア・その他',
    items: otherLinks,
  },
];

// 法的リンク
export const legalLinks: NavigationItem[] = [
  { name: '会社概要', href: '/company' },
  { name: '利用規約', href: '/company/legal/terms', publishDate: '2025-08-11', lastUpdated: '2026-02-05' },
  { name: '個人情報保護方針', href: '/company/legal/privacy', publishDate: '2025-08-11', lastUpdated: '2026-02-05' },
  { name: '免責事項', href: '/company/disclaimer', publishDate: '2025-08-11', lastUpdated: '2026-01-15' },
];

// その他公開ページ（日付管理用）
export const otherPublicPages: NavigationItem[] = [
  { name: 'よくある質問', href: '/company/faq', publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
  { name: '料金プラン', href: '/company/pricing', publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
  { name: 'お問い合わせ', href: '/company/contact', publishDate: '2026-01-15', lastUpdated: '2026-01-15' },
  { name: 'メディア', href: '/media', publishDate: '2026-01-15', lastUpdated: '2026-02-10' },
];

// 全公開ページの日付情報を取得するヘルパー関数
export function getPageInfo(href: string): NavigationItem | undefined {
  // ツールページ
  const toolInfo = getToolInfo(href);
  if (toolInfo) return toolInfo;
  // 会社ページ
  const companyInfo = getCompanyPageInfo(href);
  if (companyInfo) return companyInfo;
  // 法的ページ
  const legalInfo = legalLinks.find(item => item.href === href);
  if (legalInfo) return legalInfo;
  // その他ページ
  return otherPublicPages.find(item => item.href === href);
}
