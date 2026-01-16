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

// 50音の個別文字を判定（濁音・半濁音は清音に統一）
export function getKanaChar(reading: string): string {
  if (!reading) return 'その他';
  const firstChar = reading.charAt(0);

  // 英字
  if (/^[A-Za-z]/.test(firstChar)) {
    return 'A-Z';
  }

  // 濁音・半濁音を清音に変換するマップ
  const kanaMap: { [key: string]: string } = {
    // が行 → か行
    'が': 'か', 'ぎ': 'き', 'ぐ': 'く', 'げ': 'け', 'ご': 'こ',
    'ガ': 'カ', 'ギ': 'キ', 'グ': 'ク', 'ゲ': 'ケ', 'ゴ': 'コ',
    // ざ行 → さ行
    'ざ': 'さ', 'じ': 'し', 'ず': 'す', 'ぜ': 'せ', 'ぞ': 'そ',
    'ザ': 'サ', 'ジ': 'シ', 'ズ': 'ス', 'ゼ': 'セ', 'ゾ': 'ソ',
    // だ行 → た行
    'だ': 'た', 'ぢ': 'ち', 'づ': 'つ', 'で': 'て', 'ど': 'と',
    'ダ': 'タ', 'ヂ': 'チ', 'ヅ': 'ツ', 'デ': 'テ', 'ド': 'ト',
    // ば行・ぱ行 → は行
    'ば': 'は', 'び': 'ひ', 'ぶ': 'ふ', 'べ': 'へ', 'ぼ': 'ほ',
    'バ': 'ハ', 'ビ': 'ヒ', 'ブ': 'フ', 'ベ': 'ヘ', 'ボ': 'ホ',
    'ぱ': 'は', 'ぴ': 'ひ', 'ぷ': 'ふ', 'ぺ': 'へ', 'ぽ': 'ほ',
    'パ': 'ハ', 'ピ': 'ヒ', 'プ': 'フ', 'ペ': 'ヘ', 'ポ': 'ホ',
    // カタカナ → ひらがな
    'ア': 'あ', 'イ': 'い', 'ウ': 'う', 'エ': 'え', 'オ': 'お',
    'カ': 'か', 'キ': 'き', 'ク': 'く', 'ケ': 'け', 'コ': 'こ',
    'サ': 'さ', 'シ': 'し', 'ス': 'す', 'セ': 'せ', 'ソ': 'そ',
    'タ': 'た', 'チ': 'ち', 'ツ': 'つ', 'テ': 'て', 'ト': 'と',
    'ナ': 'な', 'ニ': 'に', 'ヌ': 'ぬ', 'ネ': 'ね', 'ノ': 'の',
    'ハ': 'は', 'ヒ': 'ひ', 'フ': 'ふ', 'ヘ': 'へ', 'ホ': 'ほ',
    'マ': 'ま', 'ミ': 'み', 'ム': 'む', 'メ': 'め', 'モ': 'も',
    'ヤ': 'や', 'ユ': 'ゆ', 'ヨ': 'よ',
    'ラ': 'ら', 'リ': 'り', 'ル': 'る', 'レ': 'れ', 'ロ': 'ろ',
    'ワ': 'わ', 'ヲ': 'を', 'ン': 'ん',
  };

  const normalized = kanaMap[firstChar] || firstChar;

  // 50音に含まれるか確認
  const validKana = [
    'あ', 'い', 'う', 'え', 'お',
    'か', 'き', 'く', 'け', 'こ',
    'さ', 'し', 'す', 'せ', 'そ',
    'た', 'ち', 'つ', 'て', 'と',
    'な', 'に', 'ぬ', 'ね', 'の',
    'は', 'ひ', 'ふ', 'へ', 'ほ',
    'ま', 'み', 'む', 'め', 'も',
    'や', 'ゆ', 'よ',
    'ら', 'り', 'る', 'れ', 'ろ',
    'わ', 'を', 'ん',
  ];

  if (validKana.includes(normalized)) {
    return normalized;
  }

  return 'その他';
}

// 50音順の文字の順序
export const KANA_CHAR_ORDER = [
  'あ', 'い', 'う', 'え', 'お',
  'か', 'き', 'く', 'け', 'こ',
  'さ', 'し', 'す', 'せ', 'そ',
  'た', 'ち', 'つ', 'て', 'と',
  'な', 'に', 'ぬ', 'ね', 'の',
  'は', 'ひ', 'ふ', 'へ', 'ほ',
  'ま', 'み', 'む', 'め', 'も',
  'や', 'ゆ', 'よ',
  'ら', 'り', 'る', 'れ', 'ろ',
  'わ', 'を', 'ん',
  'A-Z', 'その他'
];

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
