import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const GLOSSARY_DIR = path.join(process.cwd(), 'content/glossary');

export interface GlossaryMeta {
  slug: string;
  title: string;
  shortTitle: string; // 一覧表示用の短いタイトル
  reading: string; // 読み仮名（50音順ソート用）
  description: string;
  category: string;
  relatedTools?: string; // 関連シミュレーターへのリンク
  keywords?: string[];
}

// 50音の行を判定（濁音・半濁音は清音に統一）
export function getKanaRow(reading: string): string {
  if (!reading) return 'その他';
  const firstChar = reading.charAt(0);

  // 英字
  if (/^[A-Za-z]/.test(firstChar)) {
    return 'A-Z';
  }

  // 各行に属する文字のマップ（濁音・半濁音・カタカナ含む）
  const rowMap: { [key: string]: string } = {
    // あ行
    'あ': 'あ行', 'い': 'あ行', 'う': 'あ行', 'え': 'あ行', 'お': 'あ行',
    'ア': 'あ行', 'イ': 'あ行', 'ウ': 'あ行', 'エ': 'あ行', 'オ': 'あ行',
    // か行（が行含む）
    'か': 'か行', 'き': 'か行', 'く': 'か行', 'け': 'か行', 'こ': 'か行',
    'が': 'か行', 'ぎ': 'か行', 'ぐ': 'か行', 'げ': 'か行', 'ご': 'か行',
    'カ': 'か行', 'キ': 'か行', 'ク': 'か行', 'ケ': 'か行', 'コ': 'か行',
    'ガ': 'か行', 'ギ': 'か行', 'グ': 'か行', 'ゲ': 'か行', 'ゴ': 'か行',
    // さ行（ざ行含む）
    'さ': 'さ行', 'し': 'さ行', 'す': 'さ行', 'せ': 'さ行', 'そ': 'さ行',
    'ざ': 'さ行', 'じ': 'さ行', 'ず': 'さ行', 'ぜ': 'さ行', 'ぞ': 'さ行',
    'サ': 'さ行', 'シ': 'さ行', 'ス': 'さ行', 'セ': 'さ行', 'ソ': 'さ行',
    'ザ': 'さ行', 'ジ': 'さ行', 'ズ': 'さ行', 'ゼ': 'さ行', 'ゾ': 'さ行',
    // た行（だ行含む）
    'た': 'た行', 'ち': 'た行', 'つ': 'た行', 'て': 'た行', 'と': 'た行',
    'だ': 'た行', 'ぢ': 'た行', 'づ': 'た行', 'で': 'た行', 'ど': 'た行',
    'タ': 'た行', 'チ': 'た行', 'ツ': 'た行', 'テ': 'た行', 'ト': 'た行',
    'ダ': 'た行', 'ヂ': 'た行', 'ヅ': 'た行', 'デ': 'た行', 'ド': 'た行',
    // な行
    'な': 'な行', 'に': 'な行', 'ぬ': 'な行', 'ね': 'な行', 'の': 'な行',
    'ナ': 'な行', 'ニ': 'な行', 'ヌ': 'な行', 'ネ': 'な行', 'ノ': 'な行',
    // は行（ば行・ぱ行含む）
    'は': 'は行', 'ひ': 'は行', 'ふ': 'は行', 'へ': 'は行', 'ほ': 'は行',
    'ば': 'は行', 'び': 'は行', 'ぶ': 'は行', 'べ': 'は行', 'ぼ': 'は行',
    'ぱ': 'は行', 'ぴ': 'は行', 'ぷ': 'は行', 'ぺ': 'は行', 'ぽ': 'は行',
    'ハ': 'は行', 'ヒ': 'は行', 'フ': 'は行', 'ヘ': 'は行', 'ホ': 'は行',
    'バ': 'は行', 'ビ': 'は行', 'ブ': 'は行', 'ベ': 'は行', 'ボ': 'は行',
    'パ': 'は行', 'ピ': 'は行', 'プ': 'は行', 'ペ': 'は行', 'ポ': 'は行',
    // ま行
    'ま': 'ま行', 'み': 'ま行', 'む': 'ま行', 'め': 'ま行', 'も': 'ま行',
    'マ': 'ま行', 'ミ': 'ま行', 'ム': 'ま行', 'メ': 'ま行', 'モ': 'ま行',
    // や行
    'や': 'や行', 'ゆ': 'や行', 'よ': 'や行',
    'ヤ': 'や行', 'ユ': 'や行', 'ヨ': 'や行',
    // ら行
    'ら': 'ら行', 'り': 'ら行', 'る': 'ら行', 'れ': 'ら行', 'ろ': 'ら行',
    'ラ': 'ら行', 'リ': 'ら行', 'ル': 'ら行', 'レ': 'ら行', 'ロ': 'ら行',
    // わ行
    'わ': 'わ行', 'を': 'わ行', 'ん': 'わ行',
    'ワ': 'わ行', 'ヲ': 'わ行', 'ン': 'わ行',
  };

  return rowMap[firstChar] || 'その他';
}

// 後方互換性のため getKanaChar も維持（getKanaRow のエイリアス）
export function getKanaChar(reading: string): string {
  return getKanaRow(reading);
}

// 50音順の行の順序（あ行〜ら行）
export const KANA_ROW_ORDER = [
  'あ行', 'か行', 'さ行', 'た行', 'な行',
  'は行', 'ま行', 'や行', 'ら行',
];

// 後方互換性のため KANA_CHAR_ORDER も維持
export const KANA_CHAR_ORDER = KANA_ROW_ORDER;

export interface GlossaryTerm extends GlossaryMeta {
  content: string;
}

// すべての用語を取得
export function getAllGlossaryTerms(): GlossaryMeta[] {
  if (!fs.existsSync(GLOSSARY_DIR)) {
    return [];
  }

  const files = fs.readdirSync(GLOSSARY_DIR).filter((file) => file.endsWith('.mdx'));

  const terms: GlossaryMeta[] = [];

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, '');
    const filePath = path.join(GLOSSARY_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(fileContent);

    terms.push({
      slug,
      title: data.title || '',
      shortTitle: data.shortTitle || data.title || '',
      reading: data.reading || '',
      description: data.description || '',
      category: data.category || '',
      relatedTools: data.relatedTools || undefined,
      keywords: data.keywords || [],
    });
  }

  // カテゴリ順、タイトル順でソート
  return terms.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category, 'ja');
    }
    return a.title.localeCompare(b.title, 'ja');
  });
}

// スラッグで用語を取得
export function getGlossaryTermBySlug(slug: string): GlossaryTerm | null {
  const filePath = path.join(GLOSSARY_DIR, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

  return {
    slug,
    title: data.title || '',
    shortTitle: data.shortTitle || data.title || '',
    reading: data.reading || '',
    description: data.description || '',
    category: data.category || '',
    relatedTools: data.relatedTools || undefined,
    keywords: data.keywords || [],
    content,
  };
}

// カテゴリ別に用語を取得
export function getGlossaryTermsByCategory(category: string): GlossaryMeta[] {
  const terms = getAllGlossaryTerms();
  return terms.filter((term) => term.category === category);
}

// 全カテゴリー一覧を取得
export function getAllGlossaryCategories(): string[] {
  const terms = getAllGlossaryTerms();
  const categories = new Set<string>();

  for (const term of terms) {
    if (term.category) {
      categories.add(term.category);
    }
  }

  return Array.from(categories).sort((a, b) => a.localeCompare(b, 'ja'));
}

// 全ての用語パスを取得（静的生成用）
export function getAllGlossarySlugs(): string[] {
  const terms = getAllGlossaryTerms();
  return terms.map((term) => term.slug);
}

// 特定のツールに関連する用語を取得（逆引き）
export function getGlossaryTermsByTool(toolPath: string): GlossaryMeta[] {
  const terms = getAllGlossaryTerms();
  return terms.filter((term) => term.relatedTools === toolPath);
}
