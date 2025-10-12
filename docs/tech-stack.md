# 技術スタック詳細

## フロントエンド

### コアライブラリ
- **React**: 19.2.0 - UIライブラリ
- **React DOM**: 19.2.0 - DOM操作
- **React Scripts**: 5.0.1 - Create React App ビルドツール

### ルーティング
- **React Router DOM**: 7.9.4
  - クライアントサイドルーティング
  - ページ遷移管理

### スタイリング
- **Tailwind CSS**: 4.1.14
  - ユーティリティファーストCSSフレームワーク
  - カスタムカラー設定（primary: #6ccaf1）
- **PostCSS**: 8.5.6 - CSS処理
- **Autoprefixer**: 10.4.21 - ベンダープレフィックス自動付与

### アニメーション
- **Framer Motion**: 12.23.24
  - スクロールアニメーション
  - ページ遷移アニメーション
  - モーション効果

### フォーム管理
- **React Hook Form**: 7.65.0
  - フォーム状態管理
  - パフォーマンス最適化
- **Yup**: 1.7.1 - バリデーションスキーマ
- **@hookform/resolvers**: 5.2.2 - Yup連携

### アイコン
- **React Icons**: 5.5.0
  - Font Awesome、Material Iconsなど多数対応
  - 使用アイコン: FaBars, FaTimes

### SEO
- **React Helmet Async**: 2.0.5
  - meta tag動的管理
  - OGP設定

### メール送信
- **@emailjs/browser**: 4.4.1
  - フォーム送信機能
  - バックエンド不要のメール送信

## 開発ツール

### テスト
- **@testing-library/react**: 16.3.0
- **@testing-library/jest-dom**: 6.9.1
- **@testing-library/user-event**: 13.5.0
- **@testing-library/dom**: 10.4.1

### その他
- **web-vitals**: 2.1.4 - パフォーマンス計測

## プロジェクト構造

```
linkle-hp/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── Header.js       # ヘッダーナビゲーション
│   │       └── Footer.js       # フッター
│   ├── pages/
│   │   ├── Home/
│   │   │   └── Home.js         # トップページ
│   │   ├── About/
│   │   │   └── About.js        # 会社概要
│   │   ├── Service/
│   │   │   └── Service.js      # サービス紹介
│   │   ├── News/
│   │   │   └── News.js         # ニュース一覧
│   │   ├── Recruit/
│   │   │   └── Recruit.js      # 採用情報
│   │   └── Contact/
│   │       └── Contact.js      # お問い合わせ
│   ├── data/
│   │   └── news.json           # ニュースデータ
│   ├── assets/
│   │   └── images/             # 画像ファイル
│   ├── hooks/                  # カスタムフック（今後追加）
│   ├── utils/                  # ユーティリティ関数（今後追加）
│   ├── App.js                  # ルーティング設定
│   ├── index.js                # エントリーポイント
│   └── index.css               # グローバルスタイル
├── docs/
│   ├── requirements.md         # 要件定義書
│   └── tech-stack.md          # 本ファイル
├── tailwind.config.js          # Tailwind設定
├── postcss.config.js           # PostCSS設定
└── package.json
```

## カスタム設定

### Tailwind CSS カラー設定
```javascript
colors: {
  primary: '#6ccaf1',
  'primary-dark': '#5ab8df',
  'primary-light': '#8ed6f5',
}
```

### レスポンシブブレークポイント（Tailwind デフォルト）
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## 開発フロー

### 開発サーバー起動
```bash
npm start
```
- ポート: http://localhost:3000
- ホットリロード有効

### ビルド
```bash
npm run build
```
- 最適化された本番用ファイルを`build/`に出力

### テスト実行
```bash
npm test
```

## 今後の追加予定

### EmailJS設定
お問い合わせフォームを有効化するために、以下の設定が必要です：

1. EmailJSアカウント作成（https://www.emailjs.com/）
2. サービスID、テンプレートID、パブリックキーを取得
3. `Contact.js`のコメントアウト部分を環境変数で設定

```javascript
// .env.local に追加
REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key
```

### Google Maps埋め込み
`About.js`のマップセクションにGoogle Maps APIを統合

### Google Analytics
Google Analytics 4をindex.htmlに追加

### SEO最適化
各ページにReact Helmetを使用してmeta tagを設定

---

**最終更新**: 2025年10月12日
