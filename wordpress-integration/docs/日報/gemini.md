はい、承知いたしました。 これまでの流れをClaude Code（または他のAIアシスタント）に指示できるよう、具体的な手順とコードをまとめた指示書を作成します。

Claude Codeへの指示書
こんにちは。これからWordPressを使って、日本の市区町村ごと（約1900件）の地価情報サイトを自動生成するプロジェクトを手伝ってください。

全体の流れは以下の通りです。

データ準備: Python (Pandas) を使い、国土交通省の地価公示データから必要な情報を抽出し、WordPressにインポートするためのCSVファイルを作成します。

WordPressの構造設計: WordPressプラグイン「Custom Post Type UI」と「Advanced Custom Fields」を使い、地価データ専用の投稿タイプとカスタムフィールドを定義します。

表示テンプレート作成: 「地価情報」を個別に表示するためのPHPテンプレートファイル (single-chika.php) を作成します。

データの一括インポート: 「WP All Import」プラグインを使い、ステップ1で作成したCSVファイルをWordPressに流し込み、全ページを自動生成します。

以下に、各ステップで必要なコードと設定内容を具体的に指示します。

ステップ1：データ準備 (Python)
まず、国土交通省のサイトからダウンロードした地価公示データ（例: kouji_2025.csv）を加工し、WordPressインポート用の import_data.csv を作成します。

要件:

市区町村ごとにデータを集計する。

列は「市区町村名」「平均地価」「平均坪単価」「平均変動率」とする。

WordPressインポート用に、列名を post_title, heikin_chika, tsubo_tanka, hendo_ritsu にする。

Pythonコード:

Python

import pandas as pd

# --- 設定項目 ---
# ダウンロードした元のファイル名
source_file = 'kouji_2025.csv'
# 出力するファイル名
output_file = 'import_data.csv'

# --- データ読み込み ---
# Shift-JISで読み込む必要がある場合が多い
try:
    df = pd.read_csv(source_file, encoding='shift_jis')
except UnicodeDecodeError:
    df = pd.read_csv(source_file, encoding='cp932')

# --- データの加工 ---
# 必要な列を抽出（列名は実際のCSVに合わせて調整してください）
# 例として、'都道府県名', '市区町村名', 'H27価格', 'H26価格' を使用します
df_needed = df[['都道府県名', '市区町村名', 'H27価格', 'H26価格']].copy()

# 価格データを数値に変換（変換できないものは欠損値NaNにする）
df_needed['H27価格'] = pd.to_numeric(df_needed['H27価格'], errors='coerce')
df_needed['H26価格'] = pd.to_numeric(df_needed['H26価格'], errors='coerce')

# 欠損値を削除
df_needed.dropna(subset=['H27価格', 'H26価格'], inplace=True)

# 市区町村名を結合してキーを作成
df_needed['full_name'] = df_needed['都道府県名'] + df_needed['市区町村名']

# 市区町村ごとに平均値を計算
df_agg = df_needed.groupby('full_name').agg({
    'H27価格': 'mean',
    'H26価格': 'mean'
}).reset_index()

# --- WordPress用の列を作成 ---
df_wp = pd.DataFrame()

# 1. post_title (投稿タイトル)
df_wp['post_title'] = df_agg['full_name']

# 2. heikin_chika (平均地価)
df_wp['heikin_chika'] = df_agg['H27価格'].round(0).astype(int)

# 3. tsubo_tanka (坪単価)
df_wp['tsubo_tanka'] = (df_agg['H27価格'] * 3.30578 / 10000).round(1)

# 4. hendo_ritsu (変動率)
df_wp['hendo_ritsu'] = ((df_agg['H27価格'] - df_agg['H26価格']) / df_agg['H26価格'] * 100).round(2)
# 変動率を文字列として整形
df_wp['hendo_ritsu'] = df_wp['hendo_ritsu'].apply(lambda x: f"+{x}%" if x > 0 else f"{x}%")


# --- CSVファイルとして出力 ---
df_wp.to_csv(output_file, index=False, encoding='utf-8-sig')

print(f"'{output_file}' の作成が完了しました。")
print(df_wp.head())

ステップ2：WordPressの構造設計 (プラグイン設定)
WordPressにログインし、以下のプラグインをインストール・有効化してください。

Custom Post Type UI (CPT UI)

Advanced Custom Fields (ACF)

WP All Import

2-1. Custom Post Type UI (CPT UI) の設定
管理画面の「CPT UI」→「投稿タイプの追加と編集」で、以下の設定を行います。

投稿タイプスラッグ: chika

複数形のラベル: 地価情報

単数形のラベル: 地価情報

サポート: 「タイトル」「エディター」「カスタムフィールド」「リビジョン」にチェックを入れる。

2-2. Advanced Custom Fields (ACF) の設定
管理画面の「ACF」→「フィールドグループ」→「新規追加」で、以下の設定を行います。

フィールドグループ名: 地価データ

フィールドの追加:

フィールドラベル: 平均地価, フィールド名: heikin_chika, フィールドタイプ: テキスト

フィールドラベル: 坪単価, フィールド名: tsubo_tanka, フィールドタイプ: テキスト

フィールドラベル: 変動率, フィールド名: hendo_ritsu, フィールドタイプ: テキスト

設定（このフィールドグループを表示する条件）:

「投稿タイプ」「等しい」「地価情報」

ステップ3：表示テンプレート作成 (PHP)
WordPressテーマのフォルダ内に、以下の内容で single-chika.php というファイルを作成してください。

ファイル名: single-chika.php

PHPコード:

PHP

<?php
/**
 * Template Name: Chika Single Page
 * Template for displaying a single "chika" post type.
 */

get_header(); // ヘッダーを読み込み
?>

<main id="main-content" class="main-content">
  <div class="container">
    <?php if (have_posts()) : while (have_posts()) : the_post(); ?>

      <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
        <header class="entry-header">
          <h1 class="entry-title"><?php the_title(); ?> の公示地価・不動産情報</h1>
        </header>

        <div class="entry-content">
          <h2>基本データ</h2>
          <ul>
            <li><strong>平均地価:</strong> <?php echo esc_html(get_field('heikin_chika')); ?> 円/㎡</li>
            <li><strong>坪単価:</strong> <?php echo esc_html(get_field('tsubo_tanka')); ?> 万円/坪</li>
            <li><strong>前年比変動率:</strong> <?php echo esc_html(get_field('hendo_ritsu')); ?></li>
          </ul>

          <hr>

          <h2>詳細情報</h2>
          <?php the_content(); ?>
        </div>
      </article>

    <?php endwhile; endif; ?>
  </div>
</main>

<?php get_footer(); // フッターを読み込み ?>

ステップ4：データの一括インポート (WP All Import)
最後に、WP All Importを使って全ページを自動生成します。

管理画面の「All Import」→「New Import」へ進みます。

ステップ1で作成した import_data.csv をアップロードします。

インポート先の投稿タイプとして「地価情報」を選択します。

インポート設定画面でのマッピング:

Title & Content:

Title の欄に、右側のCSVデータから post_title をドラッグ＆ドロップします。

Custom Fields:

ACFで作成した heikin_chika, tsubo_tanka, hendo_ritsu の各欄が表示されています。

それぞれの欄に、対応するCSVの列（heikin_chika → heikin_chika の欄）をドラッグ＆ドロップします。

インポートを実行します。

以上の手順で、約1900件の地価情報ページが自動で生成されます。よろしくお願いします。