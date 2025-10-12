# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 開発コマンド

```bash
npm start     # 開発サーバーを起動 (http://localhost:3000)
npm test      # テストを実行（インタラクティブウォッチモード）
npm run build # 本番用ビルド (build/フォルダに出力)
```

## プロジェクト概要

`linkle-hp`は、**linkleの企業ホームページ**を構築するためのReactアプリケーションです。Mijプラットフォームモノレポ内に配置されており、Create React Appで初期化されています。

## 技術スタック

- **React**: 19.2.0
- **ビルドツール**: Create React App (react-scripts 5.0.1)
- **テスティング**: Jest + React Testing Library
- **プロジェクト構造**: 標準的なCRA構造

## プロジェクト構造

```
linkle-hp/
├── public/          # 静的アセット
├── src/
│   ├── App.js       # メインアプリケーションコンポーネント
│   ├── index.js     # アプリケーションエントリーポイント
│   └── setupTests.js # テスト設定
└── package.json
```

## サイト構成

### 必要ページ
1. トップページ (`/`)
2. 会社概要 (`/about`)
3. サービス紹介 (`/service`) - Web制作特化
4. ニュース・お知らせ (`/news`)
5. 採用情報 (`/recruit`)
6. お問い合わせ (`/contact`)

## デザイン要件

- **ベースカラー**: #6ccaf1
- **参考サイト**: https://neu-ad.jp/
- レスポンシブデザイン必須（デスクトップ/タブレット/スマートフォン）
- モダンでクリーンなデザイン
- スクロールアニメーション推奨

## 主要機能

### お問い合わせフォーム
- お問い合わせ種別（選択式）
- 氏名、メールアドレス、会社名、お問い合わせ内容
- 送信先: one@linkle.group
- バリデーション機能必須

### ニュース管理
- JSONまたはMarkdownファイルで管理
- 開発者が直接Git経由で更新
- トップページに最新3件表示
- 一覧ページでページネーション

## 会社情報

- **会社名**: linkle株式会社
- **設立**: 2025年1月30日
- **代表者**: 倉石楽生
- **所在地**: 東京都渋谷区道玄坂1-12-1 渋谷マークシティ W22階
- **事業内容**: アプリ受託運営開発事業（Web制作特化）

## 重要な注意事項

- このプロジェクトはCreate React Appを使用しており、ejectしていません
- カスタム設定（webpack、babel）は公開されていません
- 標準的なCRAの規約に従います
- 日本語のみ対応（多言語対応不要）
- 詳細な要件定義は `docs/requirements.md` を参照してください
- より大きなモノレポの一部です。全体的なプロジェクトコンテキストについては、親レベルのCLAUDE.mdを参照してください
