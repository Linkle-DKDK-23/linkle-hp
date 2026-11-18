# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 開発コマンド

```bash
npm run dev     # 開発サーバー (http://localhost:3000)
npm run build   # 静的書き出し (out/) + canonical の後処理 (scripts/postbuild.mjs)
npm run check   # out/ の検査: title / description / canonical / h1 / リンク切れ / sitemap / 掲載しない表現
npm run preview # out/ をローカルで配信 (http://localhost:3010)
npm run deploy  # build → check → S3 (linkle-hp) 同期 → CloudFront (E1P3P8CPSEO8HE) 無効化 → IndexNow 送信
npm run indexnow # sitemap の URL を IndexNow（Bing など）に送る。デプロイ後に実行。--dry-run で内容確認
npm run seo:report # 週次の SEO レポートを docs/seo/reports/ に書き出す（gcloud にオーナーでログイン済みであること）
```

## プロジェクト概要

`linkle-hp` は **Linkle株式会社のコーポレートサイト**です。Next.js（App Router）の静的書き出しで、S3 + CloudFront から配信します。
2026年11月に Create React App から全面刷新しました。経緯と決定事項は `docs/renewal/00-hearing.md`。

- **会社の顔**: システム開発会社。事業は 業務システム開発 / FDE（常駐・準委任）/ DX支援・業務効率化 / Web制作
- **注力領域**: 建設業（専門工事会社）。「建設業 システム開発」「{業種} 業務システム / 管理システム」での検索流入を、`/construction-dx` と `/industries/*` で狙う（根拠は `docs/renewal/research-seo.md`）
- **トップ見出し**: 「システムに、仕事を合わせない。」

## 構成

```
app/                    ページ（すべて静的）。layout.jsx が共通の枠
  page.jsx              トップ
  service/              事業内容（4事業を1ページに。#system #fde #dx #web）
  construction-dx/      建設業向けシステム開発（柱ページ）
  industries/           業種ハブ + [slug]（8業種）
  works/                開発事例 + [slug]
  about/ recruit/ news/ contact/
  sitemap.js robots.js not-found.jsx globals.css
components/             Header / Footer / ui.jsx（共通部品）/ GuideDialog / ContactForm / Effects
content/                原稿。ページの文言はここを直す
  home.js service.js construction.js works.js news.json
  industries/<slug>.js  業種ページの原稿（index.js に登録）
lib/
  site.js seo.js mail.js
  effects/site.js       輪・波紋・スクロール連動・ページ遷移（DOM を直接操作）
  effects/fx3d.js       Three.js の粒子、anime.js の文字の動き
scripts/                postbuild.mjs / check-export.mjs / og/
infra/cloudfront/       viewer-request.js（www → apex、末尾スラッシュ除去、/about → /about/index.html）
docs/renewal/           調査・決定事項・デザインモック（mocks/d-ring が採用案）
```

## 実装上の決まり

- **サイト内リンクは `<a href="/about">`（末尾スラッシュなし、next/link は使わない）。** ページ遷移は通常のページ読み込みで、`lib/effects/site.js` が水色の円で覆う演出を付ける。演出コードは読み込みごとに一度だけ動く前提で、後始末を持たない。
- **canonical は末尾スラッシュなし。** Next は末尾スラッシュ付きで出すので `scripts/postbuild.mjs` が直す。`next build` を単体で使わず `npm run build` を使う。
- **背景の輪は `data-rings`**（`[x, y, 半径, 内径比, 不透明度]` を最大4つ。x・y は画面比、半径は PC で画面高さ比・スマホで画面幅比）。`data-sec` の付いた節ごとに配置を書き、スクロールで補間される。スマホ用は `data-rings-m`。
- **画面が止まる演出は `data-pin`**（stmt / hs / iris / flow）。PC 幅かつ動きを減らす設定でない場合だけ有効。
- **資料リンクは `<GuideLink>`。** 代表者名・会社名・メールの入力後に https://guide.linkle.group/read.html を開く。入力内容は EmailJS で one@linkle.group に通知する。
- **環境変数**: `.env.example` を参照。`NEXT_PUBLIC_EMAILJS_*` が無いと、お問い合わせは送信失敗の表示になる（成功を装わない）。

## 載せない・書かないもの

- 金額・料金・開発期間の具体値
- 根拠のない数字（顧客満足度など）、No.1・圧倒的などの誇張
- 事例の社名。地域・業種・会社規模（従業員数、年商の幅）は載せてよい。内容は `content/works.js` にある、お客様の資料と発注者の確認が取れた事実だけ
- 事例の費用・削減額（金額）。時間や回数の数字は載せてよい
- 業種ページの「できること」は実績ではなく「想定する構成例」として書く。導入効果を装わない。事例がある業種（荷揚げ・足場・造園）は、その事例へリンクする
- 電話番号

## デザイン

- ベースカラー #6ccaf1（面・線専用。白地の文字色には使わない）、文字は #10181f
- 白地、控えめな文字サイズ、広い余白、細い罫線。主役はロゴ由来の水色の輪
- 方眼・図面風の背景、太枠とずらした影、架空の画面イラストは使わない（不採用になった経緯あり）
- レスポンシブ必須。`prefers-reduced-motion` では演出を止める

## 会社情報

- **会社名**: Linkle株式会社（表記は「Linkle」で統一）
- **設立**: 2025年1月23日 / **代表者**: 倉石楽生
- **所在地**: 東京都豊島区西池袋2-36-1 ソフトタウン池袋913号
- **お問い合わせ先**: one@linkle.group

## 計測

- GA4（プロパティ「Linkle HP」、測定 ID `G-9MWQEBQ1P0`、`lib/site.js`）。linkle.group / guide / service のクロスドメイン計測を設定済み
- `lib/mail.js` の `track()` が送るイベント: `guide_dialog_open` / `generate_lead`（method: guide | contact）/ `guide_open`
- Search Console と GA4 への API 接続方法と刷新前の数値は `docs/renewal/03-baseline.md`

## SEO / AIO の運用

- Bing Webmaster Tools 登録済み（`public/BingSiteAuth.xml` が所有確認）。更新の通知は IndexNow（`scripts/indexnow.mjs`、キーは `public/<32桁>.txt`。どちらも消さない）
- 計画は `docs/renewal/04-seo-aio-roadmap.md`。週次で `npm run seo:report` → 所見を書く → その週の作業を決める
- 有料の掲載・広告は使わない方針。Linkle 側の作業（アカウント登録、顧客への依頼）は発注者本人が担当
- 外部プロフィール（Google ビジネスプロフィールなど）を登録したら、`lib/site.js` の `sameAs` に URL を追加する

## 注意

- ビルドは Google Fonts を取得する（next/font）。取得に失敗すると `An error occurred in next/font` で落ちるので、もう一度実行する
- OGP 画像は `scripts/og/template.html` を直してから `npm i --no-save puppeteer-core && node scripts/og/render.js`

## 公開前に必要な作業（未対応）

- CloudFront のカスタムエラーレスポンスを `/404.html`（ステータス 404）に変更する。現状は SPA 用に `/index.html` を 200 で返す設定のため、存在しない URL が 200 になる。旧サイトが動いている間に変えると旧サイトの下層ページが壊れるので、デプロイと同時に行う
- お問い合わせと資料請求の通知メールが実際に届くかを確認する（`.env.local` は設定済み）
