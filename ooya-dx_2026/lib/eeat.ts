// E-E-A-T（Experience, Expertise, Authoritativeness, Trustworthiness）構造化データ定数
// 記事 → Person（著者） → Organization（会社） のチェーンを構築

const BASE_URL = 'https://ooya.tech';

// Person JSON-LD（著者情報）
export const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${BASE_URL}/profile#person`,
  name: 'Tetsuro Togo',
  url: `${BASE_URL}/profile`,
  image: `${BASE_URL}/images/profile/profile.jpg`,
  jobTitle: '代表取締役',
  description: '開発ディレクター / マーケッター / 不動産オーナー。2025年9月時点で7戸購入、1戸売却、現在6戸保有。',
  worksFor: {
    '@type': 'Organization',
    '@id': `${BASE_URL}/company#organization`,
    name: '株式会社StartupMarketing',
  },
  hasCredential: {
    '@type': 'EducationalOccupationalCredential',
    name: '古家再生プランナー',
    url: `${BASE_URL}/docs/furuya-planner-certificate.pdf`,
    credentialCategory: '認定資格',
    recognizedBy: {
      '@type': 'Organization',
      name: '一般社団法人 全国古家再生推進協議会',
      url: 'https://zenko-kyo.or.jp/',
    },
  },
  knowsAbout: [
    '不動産投資',
    '賃貸経営',
    '古家再生',
    'Webマーケティング',
    '開発ディレクション',
    '不動産収支シミュレーション',
  ],
  sameAs: [
    'https://www.linkedin.com/in/tetsuro-togo-63aa7b216/',
    'https://x.com/tetsurotogo',
    'https://offers.jp/media/sidejob/workstyle/a_1862',
    'https://www.shibuyamov.com/interviews/webyour-times.html',
    'https://www.freelance-jp.org/talents/12828',
  ],
};

// Organization JSON-LD（会社詳細情報） - /company ページ用
export const organizationDetailJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${BASE_URL}/company#organization`,
  name: '株式会社StartupMarketing',
  alternateName: '大家DX',
  url: BASE_URL,
  logo: `${BASE_URL}/img/logo_250709_2.png`,
  description: '不動産オーナー向けの業務効率化ツール「大家DX」の開発・運営。賃貸経営のためのシミュレーションツール・計算ツールを提供。',
  taxID: '2010001212632',
  foundingDate: '2020-09-29',
  address: {
    '@type': 'PostalAddress',
    postalCode: '330-9501',
    addressRegion: '埼玉県',
    addressLocality: 'さいたま市大宮区',
    streetAddress: '桜木町2丁目3番地 大宮マルイ7階',
    addressCountry: 'JP',
  },
  founder: {
    '@type': 'Person',
    '@id': `${BASE_URL}/profile#person`,
    name: 'Tetsuro Togo',
  },
  numberOfEmployees: {
    '@type': 'QuantitativeValue',
    value: 1,
  },
};

// 記事用の author 参照（@id でPersonを参照）
export const articleAuthorRef = {
  '@type': 'Person' as const,
  '@id': `${BASE_URL}/profile#person`,
  name: 'Tetsuro Togo',
  url: `${BASE_URL}/profile`,
};

// 記事用の publisher 参照（@id でOrganizationを参照）
export const articlePublisherRef = {
  '@type': 'Organization' as const,
  '@id': `${BASE_URL}/company#organization`,
  name: '大家DX',
  url: BASE_URL,
  logo: {
    '@type': 'ImageObject' as const,
    url: `${BASE_URL}/img/logo_250709_2.png`,
  },
};
