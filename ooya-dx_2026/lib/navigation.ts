// ナビゲーション設定ファイル
// フッターやその他のナビゲーションで使用するリンク一覧を一元管理

export interface NavigationItem {
  name: string;
  description?: string;
  href: string;
  available?: boolean;
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
  { name: '賃貸経営シミュレーター', description: 'IRR、CCR、DSCR、キャッシュフロー一括計算', href: '/simulator' },
];

// カテゴリ別計算ツール
export const toolCategories: ToolCategory[] = [
  {
    id: 'investment-analysis',
    title: '物件購入・収益分析',
    description: '物件の収益性を多角的に分析',
    items: [
      { name: '賃貸経営シミュレーター', description: 'IRR・CCR・DSCR、35年キャッシュフロー一括計算', href: '/simulator', available: true },
      { name: 'IRR（内部収益率）', description: '投資の収益性を時間価値で評価', href: '/tools/irr', available: true },
      { name: 'NPV（正味現在価値）', description: 'DCF法による投資価値の評価', href: '/tools/npv', available: true },
      { name: 'ROI（投資利益率）', description: '投資効率をキャッシュフローで評価', href: '/tools/roi', available: true },
      { name: '表面利回り・実質利回り', description: '物件の利回りを計算', href: '/tools/yield-rate', available: true },
      { name: 'DCF法（収益価格）', description: '割引キャッシュフロー法による不動産評価', href: '/tools/dcf', available: true },
      { name: '積算評価', description: '土地・建物の積算価格を計算', href: '/tools/assessed-value', available: true },
      { name: '再調達価格', description: '建物の再調達原価を計算', href: '/tools/replacement-cost', available: true },
      { name: '収益還元（直接還元法）', description: '直接還元法による不動産評価', href: '/tools/income-capitalization', available: true },
      { name: 'DSCR（債務返済カバー率）', description: '返済余力を計算', href: '/tools/dscr', available: true },
      { name: 'CCR（自己資金配当率）', description: '自己資金に対する利回りを計算', href: '/tools/ccr', available: true },
      { name: 'LTV（借入比率）', description: 'レバレッジの程度を把握', href: '/tools/ltv', available: true },
      { name: 'NOI（営業純収益）', description: '経費控除後の純収益を計算', href: '/tools/noi', available: true },
      { name: 'CF（キャッシュフロー）', description: '税引前・税引後CFを計算', href: '/tools/cf', available: true },
      { name: 'キャップレート（還元利回り）', description: '還元利回りを計算・物件価格を逆算', href: '/tools/cap-rate', available: true },
    ],
  },
  {
    id: 'loan',
    title: '融資・ローン',
    description: 'ローン返済・借入シミュレーション',
    items: [
      { name: '住宅ローン', description: '毎月返済額・総返済額を計算', href: '/tools/mortgage-loan', available: true },
      { name: '借入可能額', description: '年収倍率・返済比率から判定', href: '/tools/borrowing-capacity', available: false },
      { name: '繰上返済', description: '繰上返済のメリットを計算', href: '/tools/prepayment', available: false },
    ],
  },
  {
    id: 'tax',
    title: '税金',
    description: '不動産に関わる各種税金を計算',
    items: [
      { name: '不動産取得税', description: '不動産購入時の税金を計算', href: '/tools/acquisition-tax', available: true },
      { name: '登録免許税', description: '登記にかかる税金を計算', href: '/tools/registration-tax', available: true },
      { name: '印紙税', description: '契約書・領収書の印紙税を計算', href: '/tools/stamp-tax', available: true },
      { name: '減価償却', description: '建物の年間減価償却費を計算', href: '/tools/depreciation', available: true },
      { name: '法人税', description: '不動産法人の税金を計算', href: '/tools/corporate-tax', available: true },
      { name: '贈与税', description: '不動産贈与時の税金を計算', href: '/tools/gift-tax', available: true },
      { name: '相続税', description: '遺産相続時の税金を計算', href: '/tools/inheritance-tax', available: true },
      { name: '固定資産税', description: '毎年かかる固定資産税を計算', href: '/tools/property-tax', available: false },
    ],
  },
  {
    id: 'sale',
    title: '売却',
    description: '売却時の費用・税金を計算',
    items: [
      { name: '仲介手数料', description: '売買価格から仲介手数料を計算', href: '/tools/brokerage', available: true },
      { name: '譲渡所得税', description: '不動産売却時の税金を計算', href: '/tools/capital-gains-tax', available: true },
      { name: '売却手取り', description: '税引き後の手取り額を計算', href: '/tools/sale-proceeds', available: true },
      { name: 'デッドクロス', description: '発生時期を予測', href: '/tools/dead-cross', available: true },
    ],
  },
  {
    id: 'renovation',
    title: 'リフォーム',
    description: 'リフォーム費用のシミュレーション',
    items: [
      { name: 'リフォーム費用', description: 'リフォーム費用を概算', href: '/tools/renovation-cost', available: false },
      { name: 'リフォームローン', description: 'リフォームローンの返済を計算', href: '/tools/renovation-loan', available: false },
    ],
  },
];

// 全ての計算ツール（フラットなリスト）- 後方互換性のため維持
export const calculatorTools: NavigationItem[] = toolCategories.flatMap(category => category.items);

// 利用可能なツールのみ
export const availableTools: NavigationItem[] = calculatorTools.filter(tool => tool.available);

// メディア・その他
export const otherLinks: NavigationItem[] = [
  { name: 'メディア', description: '不動産投資の基礎知識', href: '/media' },
  { name: '用語集', description: '不動産用語の解説', href: '/glossary' },
  { name: '無料テンプレート', description: 'Excel・スプレッドシート', href: '/templates' },
];

// フッターナビゲーションセクション
export const footerNavigation: NavigationSection[] = [
  {
    title: '賃貸経営シミュレーター',
    items: simulatorLinks,
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
  { name: '運営会社', href: 'https://startup-marketing.co.jp/' },
  { name: '利用規約', href: '/legal/terms' },
  { name: '個人情報保護方針', href: '/legal/privacy' },
  { name: '免責事項', href: '/disclaimer' },
];
