# B 案「Blueprint」技術設計書（02-architecture）

対象: linkle 株式会社コーポレートサイト（CRA 5 / React 19.2 / Tailwind 3.4 / framer-motion 12 / react-router-dom 7）
上位文書: `docs/design-refresh/01-concept.md`（B 案コンセプト。値・文言・セクション順はすべてこれが正）
絶対枠: `docs/design-refresh/reference/lusion-reference.md`（§1.5 寸法表・§3 実装ヒント・§5 チェックリスト 25 項目）
本書の位置づけ: 実装エージェントが**本書だけを見て**コードを書ける粒度の技術設計。コードはまだ書かない。

> 表記: G1〜G22 = 仕様書 §3 のギミック番号。§C-4.1 のように書いたときはコンセプト（01-concept.md）の節番号。「wrapper」= 仮想スクロールのスクロールコンテナ `#scroll-wrapper`。「p」= セクション進捗 0→1。
> 既存テキスト: `src/pages/*` と `src/components/layout/*` の文言は**一切変更しない**。本書で新規に許可される文字列は lusion 由来 UI ラベル（`SCROLL TO EXPLORE` / `CONTINUE TO SCROLL` / `KEEP SCROLLING` / `TO LEARN MORE` / `NEXT PAGE` / `LOADING` / `MENU` / `LET'S TALK`）と、PM 決定の MENU ラベル `ニュース`（→ `/news`）のみ。

---

## 0. 全体方針（実装者が最初に読む 12 行）

1. ネイティブスクロールは殺す。`html, body { overflow: hidden }`。スクロールは `#scroll-wrapper`（`position: fixed; inset: 0; overflow-y: auto`、スクロールバー非表示）を **lenis 1.3** が `scrollTop` 経由で動かす。
2. スクロール連動アニメーションは **framer-motion の `useScroll({ container: wrapperRef, target })` + `useTransform` + `motion.div style`** で組む。React の再レンダーを起こさない。
3. 時間駆動のシーケンス（プリローダー / ページ遷移 / LOADING / デコード文字）は **gsap 3.15 の timeline**。lenis の `raf` も gsap の ticker から呼ぶ（rAF ループは全体で 1 本）。
4. WebGL は **@react-three/fiber 9.7 の `<Canvas>` を 1 枚だけ**、`position: fixed` で最背面（z 0）に置く。シーンは `ParticleField`（G2）と `ContourField`（G9）の 2 つ。両者は**同じ地形関数** `terrain(x, z)`（fbm）を共有する。
5. 液体チューブ（G13 / G18）は WebGL ではなく **SVG goo フィルタ + CSS transform** で作る。`position: fixed` で画面中央 x に固定。
6. `+ ×` 噴水（G15）は **Canvas2D**。
7. 面（surface）は `data-surface="dark|brand|light|band"` をセクションに付け、スクロール位置から**ヘッダー線（y = 72px）**と**中央線（y = 49vh）**の 2 点で判定して `<html data-theme>` / `<html data-theme-mid>` に書く。ヘッダー・クロスヘア・インジケータの色は CSS 変数でこれに追従する。
8. ページ遷移は `TransitionProvider` の状態機械が握る。`<Link>` は使わず `useTransitionNavigate()` を使う。ルート変更のたびにプリローダーを再生し、`lenis.scrollTo(0, { immediate: true })` で先頭に戻す（既存 `ScrollTop` の置き換え）。
9. アニメーションに使う CSS プロパティは `transform` / `opacity` / `clip-path` / SVG 属性のみ。`width` / `height` / `top` / `left` は使わない（例外なし。プリローダーのバー→L も `scale` で作る）。
10. `prefers-reduced-motion: reduce` では G2 / G9 / G13 / G15 を静止画（1 フレーム描画して停止）にし、G3 / G4 / G6 / G19 を 200ms の単純フェードに落とす。構造・面色・文言は変えない。
11. WebGL 非対応（`webgl2` も `webgl` も取れない）時は G2 / G9 を Canvas2D 実装に差し替える。それ以外のギミックは DOM なので無変更。
12. 既存ページファイル（`src/pages/*/*.js`）は**文言と配列（`services` / `stats` / `companyInfo` / `features` / `process` / `benefits`）を残したまま**、JSX をセクションコンポーネントの合成に書き換える。文言を別ファイルへ移動しない。

---

## 1. 依存関係と初期セットアップ

### 1.1 パッケージ

| 操作 | パッケージ | バージョン | 用途 |
|---|---|---|---|
| 追加 | `three` | `0.186` | WebGL（G2 / G9） |
| 追加 | `@react-three/fiber` | `9.7` | React 19 対応の three ラッパー |
| 追加 | `@react-three/drei` | `10.7` | `shaderMaterial` / `useDetectGPU` のみ使用（`Html` / `Text` は使わない） |
| 追加 | `lenis` | `1.3` | 仮想スクロール（G5） |
| 追加 | `gsap` | `3.15` | 時間駆動の timeline、ticker |
| 削除 | `@tsparticles/react` `@tsparticles/slim` `tsparticles` | — | 使わない（コンセプト方針） |
| 削除（最終ステップ） | `react-icons` | — | 装飾アイコン廃止（§C-付録A）。`import` が 0 件になったことを `grep -r "react-icons" src` で確認してから削除 |

これ以外の追加は禁止。bloom（G9）は `@react-three/postprocessing` を足さず、**フラグメントシェーダ内のハロー加算**で作る（§4 G9）。

```bash
# 実行順（すべて worktree ルートで）
npm uninstall --legacy-peer-deps @tsparticles/react @tsparticles/slim tsparticles
npm install   --legacy-peer-deps three@0.186 @react-three/fiber@9.7 @react-three/drei@10.7 lenis@1.3 gsap@3.15
npm run build   # ここで通ることを確認（three の ESM は CRA 5 / webpack 5 でそのまま解決できる）
```

CRA 5 の注意: `three/examples/jsm/*` は使わない（本設計では不要）。`source-map-loader` の警告が three で出る場合は `GENERATE_SOURCEMAP=false` を `.env` に置く（既存の `.env` に EmailJS の 3 変数があるので追記）。

### 1.2 フォント読み込み（`public/index.html`）

`<head>` の `<title>` の直前に追加。`index.css` の `@import url(...Inter...)` は削除する。

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,400;0,700;1,700&family=DotGothic16&family=Dela+Gothic+One&family=Bungee&display=swap">
```

書体の役割（「若く攻めた」トーンに合わせて 2026-09 に入替。サイバー／エッジ系）:

| 書体 | 役割 | Tailwind |
|---|---|---|
| Bungee | 全ページのヒーロー巨大文字（G3 `HeroTitle`、400 のみ・大文字）。`titleStyle` / `measureFont` でページ単位の差し替え可 | インライン |
| Chakra Petch | 欧文見出し（TeamSection・カード・G12 ゴースト文字の欧文は 700）・ピル・UI。角を落とした角張りで方眼・計測器と揃える | `font-latin` |
| DotGothic16 | 和文本文・和文見出し（`font-sans` 既定）と、計測器ラベル・番号・カウンター（`.text-label` / `.text-num`）。5×7 ドット文字（PixelGlyph）と同じピクセル言語 | `font-sans` / `font-mono` |
| Dela Gothic One | 和文の巨大文字（G12 ゴースト文字 / G14 ブランド面の巨大白文字） | `font-display` |

Chakra Petch は 400 / 700 しか無いので、Tailwind の `font-medium` は 700 に再定義している（500 指定は 400 に落ちて細く見えるため）。DotGothic16 と Bungee は 400 のみなので、`html, body` に `font-synthesis: none` を置き、700 指定でも疑似ボールドをかけない。`--fs-label` は DotGothic16 が読める 12px。

`<html lang="en">` は `lang="ja"` に直す。`<meta name="theme-color" content="#000000">` はそのまま。

プリローダーは `document.fonts.load('700 1em "Chakra Petch"')`, `('400 1em "DotGothic16"')`, `('400 1em "Dela Gothic One"')`, `('400 1em "Bungee"')` の 4 つを `Promise.all` で待ってから 100 に到達させる（§2.5）。

### 1.3 `html, body { overflow: hidden }` と仮想スクロールの初期化場所

| 何を | どこで |
|---|---|
| `html, body { overflow: hidden; height: 100%; background: var(--bp-black); }` | `src/index.css` の `@layer base` |
| `#scroll-wrapper` のスタイル（fixed / inset 0 / overflow-y auto / `scrollbar-width: none` / `::-webkit-scrollbar { display: none }` / `overscroll-behavior: none`） | `src/index.css` |
| lenis インスタンス生成・破棄 | `src/components/layout/SmoothScroll.js`（`useLayoutEffect`、`App` 直下で 1 回だけマウント） |
| `gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);` | 同上 |
| `lenis.on('scroll', ...)` → `scrollStore` へ書き込み | 同上 |
| ルート変更時の `lenis.scrollTo(0, { immediate: true })` | `src/lib/transition/TransitionProvider.js`（§2.5 の `RESET` で） |

lenis の生成パラメータ（固定値）:

```js
new Lenis({
  wrapper: wrapperEl,          // #scroll-wrapper
  content: contentEl,          // #scroll-content
  lerp: 0.08,
  wheelMultiplier: 1,
  smoothWheel: true,
  syncTouch: false,            // タッチはネイティブ（wrapper 内スクロール）
  autoRaf: false,              // gsap.ticker から raf を呼ぶ
});
```

`syncTouch: false` にする理由: iOS でのタッチ慣性は OS のものを使い、lenis は wheel だけ仮想化する。`overflow-y: auto` の wrapper に対する `scrollTop` 書き込みなので `position: sticky` がそのまま効く（transform 方式ではない）。

### 1.4 Tailwind 設定（`tailwind.config.js`）

```js
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bp: {
          black: '#000000', brand: '#6ccaf1', white: '#ffffff', band: '#121416',
          ink: '#f0f1fa', ghost: '#14171b',
          'pill-dark': '#22272b', 'pill-light': '#e6eef2', field: '#f0f1fa',
          trough: '#34393f', 'rule-card': '#cfe9f5',
          'fluid-0': '#6ccaf1', 'fluid-1': '#2a8ec4', 'fluid-2': '#0b3a56',
        },
        primary: '#6ccaf1',            // 既存互換。新規コードでは bp-brand を使う
      },
      fontFamily: {
        sans: ['"Zen Kaku Gothic New"', '"Hiragino Kaku Gothic ProN"', 'sans-serif'],
        latin: ['"Instrument Sans"', '"Zen Kaku Gothic New"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      spacing: { margin: 'var(--bp-margin)' },
      zIndex: { canvas: '0', grid: '1', scroll: '2', tube: '4', ui: '10', header: '50', overlay: '90', transition: '100', preloader: '110' },
      transitionTimingFunction: { bp: 'cubic-bezier(.2,.8,.2,1)' },
      borderRadius: { sm: '8px', md: '12px', lg: '16px' },
    },
  },
  plugins: [
    // 追加 utilities（@layer utilities と同等。plugin 関数で addUtilities）
    // .text-label   : font-mono 11px, letter-spacing .12em, uppercase, tabular-nums
    // .text-num     : font-mono, font-variant-numeric: tabular-nums
    // .skew-italic  : transform: skewX(-10deg)   ← 擬似斜体（行単位）
    // .palt         : font-feature-settings: "palt"
    // .mask-line    : overflow: hidden; display: block   ← 行マスク用の窓
    // .gpu          : will-change: transform; backface-visibility: hidden
    // .surface-dark / .surface-brand / .surface-light / .surface-band : 面色 + 文字色のセット（§1.6）
  ],
};
```

既存 utilities（`.glass` `.text-gradient` `.gradient-primary` `.card-modern` `.btn-primary` `.section-padding` / スクロールバー装飾 / `html { scroll-behavior }`）は**すべて削除**する。`::selection` は `background: var(--bp-brand); color: #000` に変更（白文字はブランド色上で使えないため）。

### 1.5 CSS 変数一覧（`src/index.css` の `:root`。値は §C-4.1 / §C-4.4 のまま）

```css
:root {
  /* 面色 */
  --bp-black: #000000; --bp-brand: #6ccaf1; --bp-white: #ffffff; --bp-band: #121416;
  /* 文字色 */
  --bp-ink: #f0f1fa; --bp-ink-muted: rgba(240,241,250,.72);
  --bp-ink-dark: #000000; --bp-ink-dark-muted: rgba(0,0,0,.64); --bp-ghost: #14171b;
  /* UI 部品（面に関わらず不変） */
  --bp-pill-dark: #22272b; --bp-pill-light: #e6eef2; --bp-field: #f0f1fa;
  --bp-trough: #34393f; --bp-rule-card: #cfe9f5;
  /* 装飾レイヤ */
  --bp-grid-major: rgba(255,255,255,.10); --bp-grid-minor: rgba(255,255,255,.05);
  --bp-dim: rgba(255,255,255,.40); --bp-dim-dark: rgba(0,0,0,.40);
  --bp-cross: rgba(255,255,255,.50); --bp-cross-dark: rgba(0,0,0,.45);
  /* アクセント */
  --bp-accent-on-black: #6ccaf1; --bp-accent-on-brand: #ffffff;
  /* 液体 */
  --bp-fluid-0: #6ccaf1; --bp-fluid-1: #2a8ec4; --bp-fluid-2: #0b3a56;

  /* 寸法 */
  --bp-margin: max(20px, 5vw);
  --bp-header-y: 72px;
  --bp-cross-x0: calc(var(--bp-margin) + 8px);
  --bp-cross-pitch: calc((100vw - 2 * var(--bp-cross-x0)) / 4);
  --bp-grid-minor-pitch: calc(var(--bp-cross-pitch) / 8);
  --bp-pill-h: 45px; --bp-pill-gap: 16px; --bp-circle-btn: 46px;
  --bp-blue-btn: 84px;
  --bp-card-w: clamp(240px, 20.9vw, 316px); --bp-card-h: calc(var(--bp-card-w) * 1.4);
  --bp-card-gap: 32px; --bp-card-r: 16px; --bp-card-pad: 36px;
  --bp-card-step: 6px; --bp-card-tilt: 1deg;
  --bp-continue-w: 250px; --bp-continue-h: 53px; --bp-continue-bottom: 58px;
  --bp-footer-pitch: calc((100vw - 2 * var(--bp-margin)) / 4);
  --bp-input-w: 510px; --bp-input-h: 65px; --bp-input-r: 12px;
  --bp-top-btn: 57px;
  --bp-next-line-w: 150px; --bp-next-line-h: 2px;
  --bp-indicator: 160px; --bp-knob-w: 4px; --bp-knob-h: 30px;
  --bp-preloader-bar-w: 212px; --bp-preloader-bar-h: 45px;
  --bp-L-vert-w: 148px; --bp-L-vert-h: 448px; --bp-L-horz-w: 305px; --bp-L-horz-h: 153px;
  --bp-section-gap: 100vh;
  --bp-tube-w: 110px;
  --bp-marquee-pitch: 196px;
  --bp-radius-sm: 8px; --bp-radius-md: 12px; --bp-radius-lg: 16px; --bp-radius-full: 999px;
  --bp-ease: cubic-bezier(.2,.8,.2,1);
  --bp-z-canvas: 0; --bp-z-grid: 1; --bp-z-scroll: 2; --bp-z-tube: 4; --bp-z-ui: 10;
  --bp-z-header: 50; --bp-z-overlay: 90; --bp-z-transition: 100; --bp-z-preloader: 110;

  /* 文字サイズ（§C-4.3） */
  --fs-ghost-min: 18vw;   /* G12 の下限。実サイズは GiantGhostText が行ごとに measureText で算出（§4 G12） */
  --fs-tagline: clamp(26px, 3.2vw, 48px); --fs-tagline-ja: clamp(22px, 2.7vw, 40px);
  --fs-intro: clamp(28px, 3.45vw, 52px);  --fs-intro-ja: clamp(24px, 2.9vw, 44px);
  --fs-section: clamp(36px, 4vw, 60px);   --fs-section-ja: clamp(32px, 3.4vw, 52px);
  --fs-footer-h: clamp(28px, 3.3vw, 50px); --fs-footer-h-ja: clamp(24px, 2.65vw, 40px);
  --fs-card-title: 26px; --fs-card-title-ja: 22px; --fs-card-item: 15px;
  --fs-body: 14px; --fs-nav: 13px; --fs-label: 11px;
  --fs-counter: clamp(64px, 12vh, 100px); --fs-stat: clamp(40px, 4.5vw, 68px);

  /* 面に追従する色（§1.6 で data-theme ごとに上書き） */
  --cur-logo: var(--bp-ink);
  --cur-cross: var(--bp-cross);
  --cur-knob: var(--bp-white);
  --cur-dim: var(--bp-dim);
}
```

### 1.6 `data-theme` による色追従（`src/index.css`）

```css
:root[data-theme="dark"], :root[data-theme="band"] { --cur-logo: var(--bp-ink); }
:root[data-theme="brand"]                          { --cur-logo: var(--bp-ink-dark); }
:root[data-theme="light"]                          { --cur-logo: var(--bp-ink-dark); }

:root[data-theme-mid="dark"], :root[data-theme-mid="band"] { --cur-cross: var(--bp-cross); --cur-knob: var(--bp-white); --cur-dim: var(--bp-dim); }
:root[data-theme-mid="brand"] { --cur-cross: var(--bp-cross-dark); --cur-knob: var(--bp-white);      --cur-dim: var(--bp-dim-dark); }
:root[data-theme-mid="light"] { --cur-cross: var(--bp-cross-dark); --cur-knob: var(--bp-ink-dark);   --cur-dim: var(--bp-dim-dark); }
```

ロゴ（ヘッダー線で判定）は `--cur-logo`、クロスヘア・インジケータ・寸法線（中央線で判定）は `--cur-*` を参照する。ピルの塗り（`--bp-pill-dark` / `--bp-pill-light`）はどのテーマでも変えない（G22）。色の切替は `transition: color 240ms var(--bp-ease)`。

### 1.7 その他の初期設定

- `src/App.css` と `src/logo.svg`（CRA 雛形）は削除。`reportWebVitals` はそのまま。
- `src/index.js`: `React.StrictMode` は**維持**する。lenis / three / gsap の生成はすべて `useEffect` / `useLayoutEffect` のクリーンアップで破棄できる形にする（StrictMode の二重実行に耐える）。
- `.env`（既存 EmailJS 3 変数）に `GENERATE_SOURCEMAP=false` を追記してよい。

---

## 2. アプリ骨格

### 2.1 レイヤ構成（`src/App.js`）

```jsx
<HelmetProvider>
  <BrowserRouter>
    <MotionPrefsProvider>            {/* prefers-reduced-motion / WebGL 可否 / isMobile を Context で配布 */}
      <TransitionProvider>           {/* 状態機械（§2.5）。lenis へのアクセスも保持 */}
        <SceneCanvas />              {/* z 0   fixed  R3F Canvas。ParticleField / ContourField を内包 */}
        <GridLayer />                {/* z 1   fixed  方眼（黒面のみ表示。data-theme-mid で opacity 切替） */}
        <SmoothScroll>               {/* z 2   #scroll-wrapper（fixed, overflow-y:auto）> #scroll-content */}
          <main id="scroll-content">
            <Routes> … 6 ページ（React.lazy） … </Routes>
          </main>
        </SmoothScroll>
        <LiquidTube />               {/* z 4   fixed  配管（G13 / G18）。ページ側は TubeController 経由で状態を書く */}
        <FixedUI>                    {/* z 10  fixed  pointer-events: none（子で個別に auto） */}
          <Crosshairs />  <ScrollIndicator />  <BlueCircleButton />  <ContinuePill />
        </FixedUI>
        <Header />                   {/* z 50  fixed */}
        <MenuOverlay />              {/* z 90  fixed */}
        <PageTransition />           {/* z 100 fixed  L 字ウィンドウ + PixelLoading */}
        <Preloader />                {/* z 110 fixed */}
      </TransitionProvider>
    </MotionPrefsProvider>
  </BrowserRouter>
</HelmetProvider>
```

- `body` の背景は `--bp-black`。黒面のセクションは `background: transparent`（WebGL が透ける）。ブランド面・白面・帯のセクションは不透明な面色を持つ。
- `#scroll-wrapper` は `pointer-events: auto`。`FixedUI` 内はデフォルト `pointer-events: none`、ボタン類のみ `auto`。
- `LiquidTube`（z 4）はスクロール内容（z 2）の上に乗る。lusion 同様、黒面では巨大ゴースト文字の上を、ブランド面ではカードの**上端手前で途切れる**（§4 G13 の `bottomY` 制御）。

### 2.2 z-index スケール

| 変数 | 値 | 用途 |
|---|---|---|
| `--bp-z-canvas` | 0 | R3F Canvas |
| `--bp-z-grid` | 1 | 方眼レイヤ |
| `--bp-z-scroll` | 2 | `#scroll-wrapper`（ページ本体） |
| `--bp-z-tube` | 4 | 配管 |
| `--bp-z-ui` | 10 | クロスヘア / インジケータ / 青円ボタン / CONTINUE ピル |
| `--bp-z-header` | 50 | ヘッダー |
| `--bp-z-overlay` | 90 | MENU オーバーレイ |
| `--bp-z-transition` | 100 | ページ遷移 |
| `--bp-z-preloader` | 110 | プリローダー |

セクション内部の重なりは 0〜3 の範囲だけ使う（背景 0 / ゴースト文字 1 / 本文 2 / 噴水 Canvas 3）。`9999` などの直値は禁止。

### 2.3 スクロール状態の配布（`src/lib/scroll/scrollStore.js`）

React state を使わない module-singleton。

```js
export const scrollStore = {
  scroll: 0, limit: 0, velocity: 0, direction: 0, progress: 0,   // lenis から毎フレーム更新
  vh: 0, vw: 0,                                                    // resize で更新
  listeners: new Set(),
  set(next) { Object.assign(this, next); this.listeners.forEach(fn => fn(this)); },
  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
};
```

- `SmoothScroll` が `lenis.on('scroll', e => scrollStore.set({ scroll: e.scroll, limit: e.limit, velocity: e.velocity, direction: e.direction, progress: e.progress }))`。
- 速度連動（G22）や NEXT PAGE（G20）はこれを `subscribe` して `gsap.quickTo` / `motionValue.set` で書く。
- セクション進捗は framer-motion の `useScroll({ container: wrapperRef, target: sectionRef, offset: ['start start', 'end end'] })` を使う。`wrapperRef` は `SmoothScroll` が Context（`ScrollContainerContext`）で配布する。`whileInView` / `useInView` を使うときも必ず `viewport={{ root: wrapperRef }}` / `{ root: wrapperRef }` を渡す（root が window だと wrapper 内の要素は「常に見えている」判定になる）。

### 2.4 面（surface）判定（`src/lib/theme/surfaceRegistry.js`）

```js
// 各セクションは useSurface('dark' | 'brand' | 'light' | 'band', ref) で登録
registry = [{ el, surface, top, bottom }]           // top/bottom は wrapper 内の offsetTop（resize / ルート変更 / fonts.ready で再計測）
onScroll(scroll):
  headerY = scroll + 72
  midY    = scroll + vh * 0.49
  theme    = surfaceAt(headerY)   // registry を top 昇順で走査し top <= y < bottom の surface。該当なしは直前の値を保持
  themeMid = surfaceAt(midY)
  if changed: html.dataset.theme = theme; html.dataset.themeMid = themeMid
```

- ブランド面→白面のワイプ（G18）は「白面セクションが sticky なブランド面の上に `translateY(100vh→0)` で重なる」構造なので、境界が実際に y = 72 / 49vh を通過した時刻と registry の top が一致する（白面セクションの `top` = ワイプ開始位置 + 100vh として登録する。§4 G18）。
- `GridLayer` は `:root[data-theme-mid="dark"]` のときだけ `opacity: 1`、それ以外 `opacity: 0`（240ms）。

### 2.5 ルート遷移・プリローダー・遷移オーバーレイの状態機械（`src/lib/transition/TransitionProvider.js`）

`useReducer` で 1 つの `phase` を持つ。lenis は `phase !== 'IDLE'` の間 `lenis.stop()`。

| phase | 表示 | 入口 | 出口（次 phase） |
|---|---|---|---|
| `BOOT` | 黒 | 初回マウント | 即 `PRELOAD(full)` |
| `PRELOAD` | Preloader（バー + カウンター） | BOOT / LOADING 完了 / popstate | `Promise.all([fontsReady, webglReady, minDuration])` 解決 → `SPLIT` |
| `SPLIT` | バーが 2 矩形 → L 字（600ms） | PRELOAD | 完了 → `REVEAL` |
| `REVEAL` | L 窓が拡大回転してワイプ（1100ms）。同時にヒーローの G3 開始 | SPLIT | 完了 → `IDLE`（lenis.start()） |
| `IDLE` | 通常 | REVEAL | `navigate(to)` 呼び出し → `CAPTURE` |
| `CAPTURE` | PageTransition: L 窓が旧ページを閉じ込め縮小回転（900ms）、窓内は白へ退色 | IDLE | 完了 → `LOADING` |
| `LOADING` | 黒 + 方眼（薄） + PixelLoading（35 ドット × 15ms ≈ 525ms + 保持 200ms） | CAPTURE | 完了 → `RESET` |
| `RESET` | 黒 | LOADING | `history.push(to)`、`lenis.scrollTo(0, {immediate:true})`、`window.scrollTo(0,0)`、registry 再計測、`React.lazy` の chunk 解決を待つ → `PRELOAD(short)` |

3 経路:

1. **初回ロード**: `BOOT → PRELOAD(full: minDuration 1800ms, カウンター 000→100 を 1600ms) → SPLIT → REVEAL → IDLE`。
2. **ページ遷移（リンククリック）**: `IDLE → CAPTURE → LOADING → RESET → PRELOAD(short: minDuration 900ms, カウンター 900ms) → SPLIT → REVEAL → IDLE`。`useTransitionNavigate()` が返す `go(to)` は同一パスなら no-op、`phase !== 'IDLE'` なら無視。
3. **NEXT PAGE 自動遷移（G20）**: `NextPageBand` が `progress >= 1` で `go(nextPath)` を 1 回だけ呼ぶ（`lockRef` で二重発火防止）。経路 2 と同じ。
4. （補助）**ブラウザの戻る/進む（popstate）**: `useLocation` の変化を `phase === 'IDLE'` で検知した場合は CAPTURE を飛ばし `RESET → PRELOAD(short)` から再生（旧ページは即座に黒で隠す）。

`minDuration` と `fontsReady` は初回のみ意味を持つ。2 回目以降は `fontsReady` は即解決。`webglReady` は `SceneCanvas` が `gl.compileAsync(scene, camera)` を終えたときに解決する Promise（非対応時は即解決）。

`Preloader` / `PageTransition` は `phase` を props で受け取り、gsap timeline を `useLayoutEffect` で起動し、完了コールバックで `dispatch({ type: 'DONE', phase })` を呼ぶ。

### 2.6 ヘッダー・ナビ

- ロゴ `Linkle`（既存文言。`text-transform: uppercase` で `LINKLE` 表示）→ `/`。
- 右: `CircleButton`（46px、`--bp-pill-light`、中に L 字アイコン 18px、→ `/`）/ `Pill dark` `LET'S TALK •` → `/contact` / `Pill light` `MENU ••` → `MenuOverlay` を開く。
- `MenuOverlay`: 黒面 + 方眼、`001 ホーム` `002 会社概要` `003 サービス` `004 ニュース` `005 採用情報` `006 お問い合わせ`（番号 JetBrains Mono、文言 `--fs-section-ja`、縦組み＝縦に並べる）。開閉は `clip-path: inset(0 0 100% 0) ↔ inset(0)` 600ms。開いている間 `lenis.stop()`。Esc で閉じる。現在ページの行は番号がブランド色。
- 既存ヘッダーの 4 項目 + `お問い合わせ` はオーバーレイに集約する（ピルの `LET'S TALK` が `お問い合わせ` の導線）。

---

## 3. コンポーネント一覧

パスはすべて `src/` からの相対。「G」列は対応ギミック。props の型は JSDoc で書く（TS は導入しない）。

### 3.1 基盤（`src/lib/`）

| パス | 責務 | 主要 API |
|---|---|---|
| `lib/scroll/scrollStore.js` | スクロール状態の singleton（§2.3） | `scrollStore.subscribe(fn)` |
| `lib/scroll/ScrollContainerContext.js` | `wrapperRef` を配布 | `useScrollContainer()` |
| `lib/scroll/useSectionProgress.js` | `useScroll({container, target, offset})` の薄いラッパ。`MotionValue<number>` を返す | `useSectionProgress(ref, offset=['start start','end end'])` |
| `lib/theme/surfaceRegistry.js` | §2.4 | `useSurface(surface, ref)` |
| `lib/transition/TransitionProvider.js` | §2.5 の状態機械。lenis 参照も保持 | `useTransition()` → `{ phase, go, lenis }` |
| `lib/transition/useTransitionNavigate.js` | `go(to)` を返す。`<a href>` に `onClick preventDefault` を付ける `TLink` も export | `TLink to="/about"` |
| `lib/motion/MotionPrefsProvider.js` | `reducedMotion` / `webgl` / `isMobile(<768)` / `isTablet(<1024)` を Context 配布 | `useMotionPrefs()` |
| `lib/motion/timings.js` | 本書 §4 の duration / easing / stagger を定数化 | `T.heroLetter = { d: 1.1, stagger: .08 }` 等 |
| `lib/webgl/detect.js` | `webgl2 || webgl` の取得可否 | `isWebGLAvailable()` |
| `lib/webgl/terrain.js` | 地形関数（JS 版 fbm。GLSL 版と同係数） | `terrain(x, z) → h`（−1..1） |
| `lib/webgl/glsl.js` | 共有 GLSL 文字列（`snoise`, `fbm`, `terrain`） | `GLSL_TERRAIN` |
| `lib/text/splitText.js` | 文字分割 / 文節分割 / 行分割 | `splitChars(s)`, `splitBunsetsu(s)`, `fitGiantFontSize(lines, containerW, vh)` |
| `lib/text/pixelFont.js` | 5×7 ドット行列（`L O A D I N G` と数字 `0`〜`9`） | `PIXEL_GLYPHS['L'] = ['10000', …7 行]` |

### 3.2 共通レイアウト（`src/components/layout/`）

| パス | 責務 | props | ライブラリ | G |
|---|---|---|---|---|
| `SmoothScroll.js` | `#scroll-wrapper` / `#scroll-content`、lenis 生成、`scrollStore` 更新、`ScrollContainerContext` 配布 | `children` | lenis, gsap ticker | G5 |
| `Header.js` | ロゴ / CircleButton / 2 ピル。初回遅延出現・速度ずれ・面反転 | — | framer-motion, scrollStore | G22 |
| `MenuOverlay.js` | 全画面メニュー（§2.6） | `open, onClose` | framer-motion | — |
| `GridLayer.js` | 方眼（主線 = クロスヘア列、補助線 = 8 等分）。`repeating-linear-gradient` 2 枚 | — | CSS | 装飾 |
| `Crosshairs.js` | `+` 5 列、中央列はレジストレーションマーク。`y` を `MotionValue` で受ける | — | framer-motion | S2 |
| `ScrollIndicator.js` | 右端の溝 160px + ノブ 4×30。`progress` で `translateY` | — | scrollStore | S2 |
| `FooterReveal.js` | 白面フッター 4 カラム（既存 `Footer.js` の文言を全部引き継ぐ。`Footer.js` を**これに置き換える**） | `onSubmitEmail(value)` | framer-motion | G19 |
| `ScrollTop.js` | **削除**（`TransitionProvider` の RESET が担う） | — | — | — |

### 3.3 UI 部品（`src/components/ui/`）

| パス | 責務 | props | G |
|---|---|---|---|
| `Pill.js` | 角丸フル 45px。`variant: 'dark' | 'light'`、末尾ドット数 `dots: 1 | 2`。ホバー反転 / フォーカスリング / `active: scale(.98)` | `variant, dots, to | onClick, children` | G22 |
| `CircleButton.js` | 46px 円（ヘッダー） | `to` | — |
| `BlueCircleButton.js` | 84px `--bp-brand` 円 + 矢印 SVG。`fixed` 中央。`rotate` / `opacity` を MotionValue で受ける | `rotate: MotionValue, opacity: MotionValue, onClick` | G8 |
| `ContinuePill.js` | 250×53 白ピル `↓ CONTINUE TO SCROLL ↓`。`visible` で opacity | `visible: MotionValue` | G16 |
| `SheetNumber.js` | `[[ 003 ]]`（`padStart(3,'0')`） | `n` | G7 |
| `Ruler.js` | `| . . . . | . . . . |` 幅 185px | `width=185` | G7 |
| `DotRow.js` | `::::::::::` | `count=10` | G7 |
| `DecodeLabel.js` | 60ms ランダム英数字 → 指定文字列（`X 0084` 形式）へ確定 | `value, active` | G7 |
| `DimensionLine.js` | 寸法線 `|——|` + 値ラベル（例 `1.0°` / `316`）。水平 / 垂直 | `length, label, axis` | G3, G14 |
| `PixelGlyph.js` | 5×7 ドット 1 文字（`grid` 5×7、ドット = `div`）。`lit` 数で左上から点灯 | `char, size=34, lit=35` | G14, G21 |
| `SplitFlipText.js` | 文字二重分割（進入 / ホバーで入れ替え） | `text, colorTop, colorBottom, trigger: 'inview' | 'hover' | 'both'` | G17 |
| `RevealLines.js` | 行マスク・リビール（行 90ms、文字 0〜8px バラけ） | `lines: string[], inView` | G19 |
| `NumberedRow.js` | `001` + 名称 + 説明 + 点線罫 + 行末 `→`（任意） | `index, title, description, to` | G11 |

### 3.4 WebGL（`src/components/webgl/`）

| パス | 責務 | props | G |
|---|---|---|---|
| `SceneCanvas.js` | R3F `<Canvas>` 1 枚。`dpr=[1,1.5]`、`gl={{antialias:false, alpha:false, powerPreference:'high-performance'}}`、`frameloop` を可視シーン数で `'always' / 'never'` 切替。`webglReady` Promise を `TransitionProvider` に渡す。非対応時は `ParticleField2D` / `ContourField2D` を **DOM の `<canvas>`** で同じ位置に描く | — | G2, G9 |
| `SceneBus.js` | ページ側からシーンへ「どのセクションがどの進捗か」を渡す singleton（`sceneBus.hero = MotionValue`, `sceneBus.team = MotionValue`, `sceneBus.mouse = {x,y}`） | — | — |
| `ParticleField.js` | 頂点群 → 地形メッシュ。`Points`（6000 / mobile 2000）+ `LineSegments`（稜線） | `progress: MotionValue`（hero の p） | G2 |
| `ContourField.js` | 画面下半分に fbm 等高線 + ハロー発光（フルスクリーン `ShaderMaterial`） | `progress: MotionValue`（team の p）, `visible` | G9 |
| `ParticleField2D.js` / `ContourField2D.js` | Canvas2D フォールバック（§4 G2 / G9） | 同上 | G2, G9 |
| `materials/pointsMaterial.js` / `materials/contourMaterial.js` | drei `shaderMaterial` 定義 | — | — |

### 3.5 ギミック（`src/components/gimmicks/`）

| パス | 責務 | props | ライブラリ | G |
|---|---|---|---|---|
| `Preloader.js` | バー + 目盛り + 3 桁カウンター → SPLIT → REVEAL（`LWindow` を使う） | `phase, variant: 'full' | 'short', onDone` | gsap | G1 |
| `LWindow.js` | L 字（縦 148×448 + 横 305×153）を SVG `<mask>` で切る全画面レイヤ。`scale / rotate / paneOpacity / paneColor` を `gsap.quickSetter` で更新。Preloader と PageTransition で共用 | `mode: 'reveal' | 'capture'`, `ref`（imperative: `setTransform({s, r})`） | gsap | G1, G21 |
| `PageTransition.js` | CAPTURE → LOADING を再生 | `phase, onDone` | gsap | G21 |
| `PixelLoading.js` | `LOADING` 7 文字 × 5×7 ドットを左から 15ms/点で点灯 | `onDone` | gsap | G21 |
| `HeroTitle.js` | 巨大文字せり上がり（1 文字ずつ ±30°）+ 寸法線の一瞬表示 | `lines: string[], play: boolean` | framer-motion | G3 |
| `HeroMorph.js` | ゴム変形 → タグライン着地 + 行番号点灯 | `progress: MotionValue, left: string[4], right: string[2], italicLeft: number[], italicRight: boolean` | framer-motion | G4 |
| `DiagonalIntro.js` | 対角 2 文 + 文節ステージ出現 | `topLeft: string, bottomRight: string, italicPrefix: string` | framer-motion | G6 |
| `MeterLabels.js` | シート番号・ルーラー・ドット列・座標デコードの配置 | `sheet: number, coords: {x, y}` | — | G7 |
| `MarqueeRows.js` | 3 段逆方向マーキー | `rows: string[][]` | CSS animation | G10 |
| `NumberedList.js` | `NumberedRow` の列 + 右側の合計/stat ブロック | `items: {title, description, to?}[], stats?: {number, label}[]` | framer-motion | G11 |
| `GiantGhostText.js` | 低コントラスト 2 段 + 見切れる末尾行 | `top: string, bottom: string, tail: string` | CSS | G12 |
| `LiquidTube.js` | 配管（fixed）。`TubeController` から `{mode, topY, bottomY, fill, ring, break}` を受けて描画 | — | SVG + gsap | G13, G18 |
| `TubeController.js` | ページ側が `useTube({ sectionRef, from, to })` で区間を登録。スクロール位置から `LiquidTube` の状態を合成 | hook | — | G13 |
| `ExpertiseCards.js` | 白カード群（4 枚 or 6 枚横トラック / 1 枚幅 664 のフォーム用 `wide`） | `cards: {title, items: string[] | ReactNode, glyph: string}[], layout: 'row4' | 'track6' | 'wide'` | framer-motion | G14 |
| `Fireworks.js` | 花火（Canvas2D、Contact 送信完了のみ）。`rate: MotionValue` と imperative `burst()`（3 発） | `rate, ref` | Canvas2D | G15 |
| `DotLiquid.js` | 粒子の液体（Canvas2D）。白グリフ粒が下部に溜まり、カーソルで噴き上がって戻る。`burst()` | `active, depth, ref` | Canvas2D | G15' |
| `SurfaceWipe.js` | 外側 200vh。sticky ブランド面（100dvh）の後ろに白面（100dvh）を通常フローで置き、白面が上がって覆う構造 + 液のメタボール分離を `TubeController` に通知 | `children(brand), children(light)` | framer-motion | G18 |
| `NextPageBand.js` | 帯 39vh。オーバースクロール累積 → プログレス線 → `go(next)` | `nextLabel: string, nextPath: string, sheet: number` | scrollStore, lenis `virtual-scroll` | G20 |
| `StatBlock.js` | `20+ チームメンバー` / `99% 顧客満足度` | `stats` | — | G11 |

### 3.6 セクション（`src/components/sections/`）

各セクションは「外側 `<section style={{height: Nvh}} data-surface>` + 内側 `position: sticky; top: 0; height: 100dvh; overflow: hidden`」の同じ構造。`useSectionProgress` で p を得て子に配る。

| パス | 内包 | 面 |
|---|---|---|
| `HeroSection.js` | `HeroTitle` + `HeroMorph` + `SCROLL TO EXPLORE` ラベル + `sceneBus.hero` へ p を流す | dark |
| `IntroSection.js` | `DiagonalIntro` | dark |
| `TeamSection.js` | 右上見出し + `MeterLabels` + `BlueCircleButton` の rotate/opacity + `sceneBus.team` + 右下段落 + クロスヘア y 22vh 指示 + 配管導入（`useTube`） | dark |
| `BrandsSection.js` | ラベル + `MarqueeRows` | dark |
| `ListSection.js` | `NumberedList`（+ `StatBlock`） | dark |
| `GhostSection.js` | `GiantGhostText` + 配管に液が満ちる（`useTube fill`） | dark |
| `CardsSection.js` | 巨大白文字（ブランド面上端に重なる）+ ラベル/リンク + `ExpertiseCards` | brand |
| `LiquidSection.js` | 配管 U 字→円環 + `GlyphFountain` + CTA 文（`SplitFlipText`）+ 黒ピル + `ContinuePill` 表示指示 | brand |
| `FooterSection.js` | `SurfaceWipe`（brand → light）+ `FooterReveal` + `NextPageBand` | brand→light→band |
| `Spacer.js` | `height: var(--bp-section-gap)` の透明な間 | 継承 |

### 3.7 ページ（`src/pages/*/*.js`）

既存ファイル名を維持。各ページは `React.lazy` で読み込む。文言・配列は各ファイルに残し、セクションへ props で渡す。`react-icons` の import と `icon` プロパティは削除する（`title` / `description` / `label` / `value` などは残す）。

---

## 4. ギミック 22 項目の実装仕様

共通の記法: `d` = duration（秒）、`ease` は特記なければ `--bp-ease` = `cubic-bezier(.2,.8,.2,1)`（gsap では `"power3.out"` で代用可、framer では配列 `[.2,.8,.2,1]`）。`p` はそのギミックを含むセクションの進捗 0→1。「RM」= `prefers-reduced-motion: reduce`、「noGL」= WebGL 非対応、「SP」= `< 768px`。

### G1 プリローダー（`gimmicks/Preloader.js` + `LWindow.js`）

- 技術: DOM + gsap timeline。カウンターは 3 桁それぞれ `0〜9` を縦に並べた列を `translateY(-n * 1em)`。
- 構造: 画面中央に溝 212×45（`--bp-trough`）。溝の上に 1px×45px の目盛り 9 本（10% 刻み、`rgba(255,255,255,.18)`）。溝の内側に白バー（`transform-origin: left; scaleX(0→1)`）。左下にカウンター（`--fs-counter`、JetBrains Mono 400、`tabular-nums`、`bottom: -0.12em` で下端に食い込む、`left: var(--bp-margin)`）。
- 擬似コード:

```js
tl = gsap.timeline({ onComplete: () => dispatch('DONE', 'PRELOAD') })
tl.to(bar, { scaleX: 1, duration: D, ease: 'power2.inOut' }, 0)               // D = 1.6 (full) / 0.9 (short)
tl.to(counter, { value: 100, duration: D, ease: 'power2.inOut', onUpdate: () => {
  v = Math.round(counter.value); digits = String(v).padStart(3, '0')
  cols.forEach((col, i) => gsap.set(col, { y: -Number(digits[i]) + 'em' }))   // 桁ロール（各桁は transition 120ms で追従）
}}, 0)
// 完了は Promise.all([fontsReady, webglReady, tl 完了]) のあと SPLIT へ
// SPLIT (600ms): 白バーを非表示にし、矩形 A（縦 148×448）/ B（横 305×153）を最終寸法・最終位置で置き、
// transform だけで「バーの位置・寸法」から出発させる（width/height はアニメしない）
GX = cx - 453/2; GY = cy - 601/2                                  // 合成ボックス 453×601 の左上
A_c = { x: GX + 74,          y: GY + 224 }                        // A の最終中心
B_c = { x: GX + 148 + 152.5, y: GY + 448 + 76.5 }                 // B の最終中心（A の右下角に B の左上角が接する）
gsap.fromTo(A, { x: cx - A_c.x, y: cy - A_c.y, scaleX: 212/148, scaleY: 45/448 },
               { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: .6, ease: 'power3.inOut' })
gsap.fromTo(B, { x: cx - B_c.x, y: cy - B_c.y, scaleX: 212/305, scaleY: 45/153 },
               { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: .6, ease: 'power3.inOut' })   // transform-origin: center
// → A の右下角と B の左上角が接した瞬間に LWindow（同形状）へ差し替え、REVEAL へ
```

- REVEAL（1100ms）: `LWindow.mode='reveal'`。窓 = L 形状。`rotate: -8deg → -35deg`、`scale: 1 → 7`（窓が画面を覆い切る倍率。1512×827 で 7 倍）、`ease: power3.inOut`。窓の外は黒（不透明）。窓のパネル（`#e5e5e5`、`fill-opacity .85` + 方眼パターン）は `scale 1→7` の間に `opacity .85 → 0`（後半 40%）。完了で `Preloader` を `display: none`。
- REVEAL 開始と同時に `HeroTitle.play = true`（G3）、G2 は PRELOAD 中から動いている（窓から透ける）。
- 寸法: L の合成ボックス 453×601、画面中央に配置。矩形 A（縦）は左上 (0,0)、矩形 B（横）は (148,448)。
- RM: SPLIT と REVEAL を各 200ms の opacity フェードに落とす（カウンターは動かす）。SP: L の寸法を `scale(.6)` で縮小して同じ手順。noGL: 影響なし。

### G2 粒子雲 → 地形メッシュ（`webgl/ParticleField.js`）

- 技術: three `Points`（GL_POINTS、`sizeAttenuation`）+ `LineSegments`。位置は GPU 側で計算（頂点シェーダ）。CPU は uniform 更新のみ。
- 頂点数 N = 6000（desktop）/ 2000（SP）。グリッド `GX × GZ = 100 × 60`（desktop）/ `50 × 40`（SP）の格子点座標を `aGrid` 属性、初期のランダム球分布を `aCloud` 属性に持つ。
- 頂点シェーダ要点:

```glsl
uniform float uTime, uMorph, uPull; uniform vec2 uMouse; uniform float uAspect;
attribute vec3 aCloud; attribute vec2 aGrid;                 // aGrid ∈ [-1,1]²
vec3 cloud = aCloud + 0.06 * vec3(snoise(aCloud*1.3 + uTime*.15), snoise(aCloud*1.3 + 7. + uTime*.15), 0.);   // 呼吸
vec2 dm = cloud.xy - uMouse; float rep = smoothstep(.35, 0., length(dm));
cloud.xy += normalize(dm + 1e-4) * rep * .25;                 // マウス反発
vec3 mesh = vec3(aGrid.x * 1.6, terrain(aGrid.x, aGrid.y) * .25, aGrid.y * 1.0);   // 地形（fbm）
mesh = isoRotate(mesh);                                       // 等角投影: rotX(35.26°) → rotY(45°)
vec3 pos = mix(cloud, mesh, uMorph);
pos *= mix(1., .7, uPull);                                    // カメラ引き（G4 後半）
attribute float aSize;                                        // 1.5〜7px、上位 3% は 10〜14px（CPU 側で生成）
vec4 mv = view * vec4(pos, 1.);
gl_PointSize = mix(aSize, aSize * .6, uMorph) * uDpr * (300. / -mv.z);   // sizeAttenuation（遠いほど小さく）
gl_Position = projection * mv;
```

- 点サイズ属性 `aSize` の生成（CPU、初期化時 1 回）: `r = rand(); aSize = r < .97 ? 1.5 + pow(rand(), 2.) * 5.5 : 10 + rand() * 4`（97% が 1.5〜7px、3% が 10〜14px）。
- フラグメントシェーダ（柔らかい球 + 中心ハイライト。lusion の球体雲の量感）:

```glsl
vec2 c = gl_PointCoord - .5; float d = length(c);
float body = 1. - smoothstep(.35, .5, d);                    // 柔らかい円
float core = 1. - smoothstep(0., .18, d);                    // 中心ハイライト
float a = (body * .55 + core * .45) * vAlpha;               // vAlpha: 雲 1.0 / メッシュ .8
if (a < .01) discard; gl_FragColor = vec4(vec3(1.), a);      // AdditiveBlending, depthWrite false
```

- 稜線 `LineSegments`: 格子の隣接ペア（横 + 縦 = 約 2×GX×GZ 本）を `aGrid` ペアとして持つ同じ頂点シェーダ。`alpha = uMorph * .10`（白 10%）。`uMorph < .05` では `visible=false`。雲状態での「時々結ばれる稜線」は `alpha = .10 * step(.985, snoise(vec3(aGrid*4., uTime*.3)))` で確率的に点灯。
- スクロール対応（hero の p、§5 参照）: `uMorph = smoothstep(.10, .70, p)`、`uPull = smoothstep(.60, 1.0, p)`。マウス: `sceneBus.mouse` を NDC で保持、`lerp 0.1`。
- タイミング: PRELOAD 中から `uTime` を進める（窓から透ける）。REVEAL 完了後 1.2s かけて球の半径 `.55 → .85`（画面幅に拡散）。
- 可視制御: ヒーローセクションが wrapper 内 `-100vh〜+100vh` にあるときだけ `useFrame` で描画。外れたら `visible=false`。
- noGL（`ParticleField2D.js`）: `<canvas>` に 800 点、`ctx.arc` 1.5px、線は格子隣接 20% を `strokeStyle rgba(255,255,255,.1)`。同じ `terrain()`（JS 版）。30fps に間引き。
- RM: `uTime` 固定、マウス反発なし、`uMorph` はスクロールで変えるが遷移は即時（静止画の切替）。SP: N=2000、稜線なし、DPR 1.25。

### G3 巨大ブランド名せり上がり（`gimmicks/HeroTitle.js`）

- 技術: DOM + framer-motion `variants`。各行 `overflow: hidden; line-height: .85`、文字 `span` に `display: inline-block`。
- フォントサイズ `fitGiantFontSize(lines, containerW, vh)`:

```js
// fonts.ready 後、Canvas2D measureText で Instrument Sans 500 の幅を 100px 基準で測る
wMax = max(lines.map(l => measure(l, '500 100px "Instrument Sans"').width))
fsByWidth = containerW / wMax * 100           // マージン内幅 100%
fsByCap   = 0.32 * vh / 0.70                  // キャップ ≈ 32vh（Instrument Sans のキャップ高 ≈ .70em）
fs = Math.min(fsByWidth, fsByCap, 0.23 * vw)  // 上限 23vw
```

- 文字アニメ: `initial: { y: '110%', rotate: i%2 ? 30 : -30 }` → `{ y: 0, rotate: 0 }`、`d: 1.1`、`delay: i * .08`、`transform-origin` は偶数 `left bottom` / 奇数 `right bottom`。2 行のときは 2 行目の delay を `+0.25`。
- 寸法線（B 案）: 各文字の着地 200ms 前に文字の左右に `DimensionLine`（幅 = 文字幅、`--bp-dim`）を `opacity 0→1→0`（合計 400ms）で出す。着地後は残さない。
- ベースライン: 下端から 7vh（`padding-bottom: 7vh`）。`SCROLL TO EXPLORE` は右マージン揃え、下端から 26px、`--fs-label` の 1.8 倍（20px）、JetBrains Mono。
- RM: 文字全体を `opacity 0→1` 200ms。SP: 同じ手順、`delay: i * .05`。

### G4 ゴム変形 → タグライン着地（`gimmicks/HeroMorph.js`）

- 技術: framer-motion `useTransform(p, …)`。ヒーローは 400vh（100vh 表示 + 300vh ピン留め）。p はセクション全体の進捗。
- 巨大文字（G3 と同じ `span` 群を使い回す）: 文字 i（n 文字中）の

```js
t_i   = clamp((p - .02 - i*.03) / .30, 0, 1)                     // p 0.02→0.35 で左から順に
scaleX = i === 0 ? 1 - .4*t_i : 1 + 1.6*t_i                       // L は縮む、以降は右へ伸びる
skewX  = -18 * t_i; translateX = 60 * vw * t_i * (i / n); rotate = (i%2 ? -6 : 4) * t_i
opacity = 1 - smoothstep(.55, 1, t_i)
```

- タグライン 6 行（左 4 + 右 2）: 行 j の `clip-path: inset(0 0 (1-u_j)*100% 0)`、`u_j = clamp((p - .25 - j*.05) / .20, 0, 1)`、色 `#8a8d96 → #f0f1fa` を同じ u で。フォント `--fs-tagline-ja`（日本語行）/ `--fs-tagline`（欧文行）、行送り 1.42。指定行に `.skew-italic`。右ブロックは右揃えで、その 2 行のベースラインを左ブロック 3〜4 行目と揃える（両ブロックを同じ `grid` の 1 行に置き `align-items: end`）。最下行ベースラインは下端から 9vh。
- 行番号 `01`〜`06`（B 案）: 各行の左、`--fs-label`、`--bp-dim`。`x = var(--bp-cross-x0)` の主線に揃える。`opacity = smoothstep(.50, .60, p)`。
- 後半 `p .60→1.0`: タグラインは固定、G2 の `uPull` で粒子が引き、ヒーロー全体に `radial-gradient` の周辺減光（`opacity 0→.6`）を重ねる。
- RM: p ≥ .3 で巨大文字 `opacity 0`、タグライン `opacity 1` の 200ms フェード。SP: 右 2 行を左 4 行の下に左揃えで続け、`translateX` の係数を `30vw`。

### G5 仮想スクロール（`layout/SmoothScroll.js`）

- 技術: lenis 1.3（§1.3）。総スクロール ≥ 20 画面（§5 の表で保証）。
- 擬似コード:

```js
useLayoutEffect(() => {
  const lenis = new Lenis({ wrapper, content, lerp: .08, smoothWheel: true, syncTouch: false, autoRaf: false })
  const tick = (t) => lenis.raf(t * 1000); gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0)
  lenis.on('scroll', (e) => scrollStore.set({ scroll: e.scroll, limit: e.limit, velocity: e.velocity, direction: e.direction, progress: e.progress }))
  transition.attachLenis(lenis)
  return () => { gsap.ticker.remove(tick); lenis.destroy() }
}, [])
```

- 方眼（`GridLayer`）はビューポート固定なので何もしない。内容だけが流れる。
- リサイズ: `ResizeObserver(content)` → `lenis.resize()` + `surfaceRegistry.measure()`。
- RM: `lerp: 1`（即時）にし慣性を切る。SP: lenis はタッチをネイティブに任せる（`syncTouch: false`）ため慣性は OS のもの。

### G6 対角配置 + 文節ステージ出現（`gimmicks/DiagonalIntro.js`）

- 技術: DOM + framer-motion `useInView(ref, { root: wrapper, amount: .3, once: true })`。
- レイアウト: `grid-template-rows: 1fr 1fr; grid-template-columns: 1fr 1fr`。左上ブロック `grid-area: 1/1`、`padding-top: calc(170/827 * 100vh)`。右下ブロック `grid-area: 2/2`、`align-self: end`、`text-align: right`、`padding-bottom: 10vh`。幅は各 `min(56vw, 720px)`。
- 文節分割 `splitBunsetsu(text)`:

```js
seg = new Intl.Segmenter('ja', { granularity: 'word' })   // 未対応ブラウザは「、」「。」の後ろでだけ分割
parts = [...seg.segment(text)].map(s => s.segment)
// 助詞・助動詞・句読点（は/が/を/に/で/と/の/へ/も/や/、/。/です/ます/し/て）は直前の要素へ結合
out = []; for (w of parts) { if (isParticle(w) && out.length) out[out.length-1] += w; else out.push(w) }
return out          // 例: ['私たちは、', '最新の', 'Web技術と', 'デザインを', '駆使し、', …]
```

- 各文節 `span`（`display: inline-block; margin-right: .4em`）: `initial { opacity: 0, y: '.6em' }` → `{ opacity: 1, y: 0 }`、`d: .6`、`delay: k * .04`（左上ブロック → 右下ブロックの順で通し番号）。`italicPrefix`（`私たちは、`）は該当文節に `.skew-italic`。
- レジストレーションマーク列（中央クロスヘア）は `Crosshairs` 側の既定 y 49vh で自然に 2 ブロックの間を通る。
- RM: ブロック全体を `opacity` 200ms。SP: 2 ブロックを縦積み（`grid-template-columns: 1fr`、右下ブロックは右揃えのまま）。

### G7 計測器ラベル（`gimmicks/MeterLabels.js` + `ui/*`）

- 配置（TEAM 相当セクションの sticky 内、y = `calc(155/827 * 100vh)` のライン上）: `SheetNumber` は `left: var(--bp-margin)`、`Ruler` は `left: calc(50% - 250px)`（画面 1/3 付近、幅 185）、`DotRow` は `left: calc(50% + 190px)`。下部 `y = 100vh - 60px` に `Ruler` 再掲。左下（`bottom: 60px; left: var(--bp-margin)`）に `DecodeLabel` 2 行（`X 0084` / `Y 0405`。値は `MeterLabels` の props で固定。座標値の由来: そのセクションの sticky 内での SheetNumber の左上位置 px を 4 桁ゼロ埋め）。
- `DecodeLabel` 擬似コード:

```js
chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'
onActive: i = 0; id = setInterval(() => {
  out = target.split('').map((c, k) => k < i ? c : (c === ' ' ? ' ' : chars[rand()]))
  el.textContent = out.join(''); if (++i > target.length) clearInterval(id)
}, 60)                                     // 6 文字なら 420ms で確定
```

- 色は全て `--cur-dim`（40%）。フォント `.text-label`。RM: デコードせず即確定。SP: `Ruler` のみ非表示。`SheetNumber` / `DotRow` / `DecodeLabel` の 3 種は残す（同一画面で 3 種以上を維持）。

### G8 中央円形ボタン（`ui/BlueCircleButton.js`）

- 技術: `position: fixed; left: 50%; top: 49vh; translate(-50%,-50%)`、84px、`--bp-brand`、`z-index: var(--bp-z-ui)`、`pointer-events: auto`。中の矢印 SVG（線幅 1.5px、黒、長さ 28px）。
- `TeamSection` が `rotate = useTransform(p, [0, 1], [0, 180])`（`/` `/service` `/recruit` は `←`→`→`）、`/about` `/news` `/contact` は `[0, 1] → [90, 180]`（`↓` へ）を渡す。`opacity = useTransform(p, [0, .08, .85, 1], [0, 1, 1, 0])`。クリックは `lenis.scrollTo(nextSectionTop, { duration: 1.2 })`。
- ホバー: 円 `--bp-ink-dark`、矢印 `--bp-brand`（240ms）。フォーカスリング 2px `--bp-brand` オフセット 2px。押下 `scale(.98)`。
- RM: rotate をステップ（p .5 で切替）。SP: 64px に縮小。

### G9 発光等高線（`webgl/ContourField.js`）

- 技術: フルスクリーン `PlaneGeometry(2,2)` + `ShaderMaterial`（`depthTest: false`, `transparent: true`, `blending: AdditiveBlending`）。画面下半分（`uv.y < .55`）にだけ描く。
- フラグメント要点:

```glsl
uniform float uTime, uReveal, uAspect; varying vec2 vUv;
vec2 q = vec2(vUv.x * uAspect, vUv.y) * 3.0 + vec2(0., uTime * .04);
float h = terrain(q.x, q.y);                                   // G2 と同じ fbm（GLSL_TERRAIN）
float lines = 14.0; float f = fract(h * lines);
float d = min(f, 1. - f) / (lines * fwidth(h));                // 等値線までの距離（px 単位相当）
float core = 1. - smoothstep(0., 1.0, d);                      // 幅 1px の芯
float halo = exp(-d * .35) * .35;                              // ハロー（bloom 相当。追加パス不要）
float mask = smoothstep(.55, .35, vUv.y) * uReveal;            // 下半分のみ、スクロールで出現
gl_FragColor = vec4(vec3(1.), (core + halo) * mask);
```

- `uReveal = smoothstep(.05, .30, p)`（team の p）。`p > .9` で `1 - smoothstep(.9, 1, p)`。
- 標高ラベル（B 案）: 等高線の数本おきに数字ラベルを**DOM で**置く（WebGL 内テキストは使わない）。`ContourField` は初期化時に JS 版 `terrain()` で `h ∈ {−.4, −.2, 0, .2, .4}` の等値点を各 1 か所サンプリング（画面座標へ変換）し、`sceneBus.contourLabels = [{x, y, value}]` に書く。`TeamSection` がそれを読んで `.text-label`（`--cur-dim`）で `position: absolute` 配置（値は `(h*100).toFixed(0).padStart(4,'0')` の数字のみ）。
- noGL（`ContourField2D.js`）: 64×36 グリッドで JS `terrain()` をサンプル、marching squares で 14 本の等値線を `ctx.stroke`、`shadowBlur: 8; shadowColor: #fff`。20fps。
- RM: `uTime` 固定（静止）。SP: `lines = 10`、DPR 1.25。

### G10 3 段逆方向マーキー（`gimmicks/MarqueeRows.js`）

- 技術: CSS `@keyframes marquee { to { transform: translateX(-50%) } }`。各段は項目列を 2 回複製し `animation: marquee 40s linear infinite`、偶数段 `animation-direction: reverse`。`will-change: transform`。
- 行ピッチ 196px、3 段の中央段を画面中央（sticky 内 `top: 50%`）に置く。文字: 段 1・3 は Zen Kaku Gothic New 500 / 段 2 の番号は JetBrains Mono、`font-size: 40px`（SP: 28px）、色 `--bp-ink`。項目間 120px、区切りは 1px×24px の縦線（`--bp-dim`）。
- 段の内容は §C-2 #4（Home）/ §C-3.3（Service）。ホバーで `animation-play-state: paused` はしない（lusion は止まらない）。
- RM: `animation: none`、項目を 1 周分だけ静止表示。SP: 40s → 28s（相対速度を保つ）。

### G11 3 桁ゼロ埋めリスト（`gimmicks/NumberedList.js`）

- 技術: DOM。`grid-template-columns: [num] 64px [title] minmax(0, 1fr) [desc] minmax(0, 1.4fr) [arrow] 24px`。番号列の左端 = `var(--bp-cross-x0)`、名称列の左端 = `var(--bp-margin) + 64px + 24px`。
- 行: `border-bottom: 1px dotted var(--bp-dim)`、行高 `min 64px`、`padding: 20px 0`。番号 `.text-num`、`String(i+1).padStart(3,'0')`。説明 `--fs-body` `--bp-ink-muted`。`to` があれば行末 `→`（既存文言 `詳細を見る` は `aria-label` に入れ、表示は `→`）。
- 行の出現: `useInView` で `opacity 0→1, y 12→0`、`d .5`、`delay i*.06`。行ホバーで番号色 `--bp-brand`（240ms）。
- 右側 `StatBlock`（Home のみ）: `--fs-stat` JetBrains Mono 500、ラベル `.text-label`。
- RM: フェードのみ。SP: `grid-template-columns: 48px 1fr`、説明は名称の下へ折り返す。

### G12 巨大低コントラスト文字（`gimmicks/GiantGhostText.js`）

- 技術: DOM。親 `overflow: hidden; width: 100vw`。2 段とも `line-height: .9; white-space: nowrap; color: var(--bp-ghost); font-weight: 500`。上段 `.skew-italic`、`margin-left: -6vw`。下段 `margin-left: 4vw`。`z-index: 1`（本文より下、背景より上）。
- **フォントサイズは固定値ではなく行ごとにフィットさせる（`fit: 'exceed'`）**: 各行が画面幅を 15% 以上超えるまで拡大する。下限 18vw（`--fs-ghost-min`）。短い文字列（`働く` `環境` `OUR` `US`）も拡大で画面幅を超えさせ、文言は差し替えない。

```js
// GiantGhostText: fonts.ready 後と resize（debounce 150ms）ごとに再計算。HeroTitle の fitGiantFontSize と同じ measureText 方式
font(line) = isLatin(line) ? 'italic 500 100px "Instrument Sans"' /* 上段のみ italic */ : '500 100px "Zen Kaku Gothic New"'
emW(line)  = ctx.measureText(line).width / 100                    // 1em あたりの幅（skewX(-10deg) は幅に含めない）
fs_line    = Math.max(0.18 * vw, 1.15 * vw / emW(line))            // 画面幅の 115% 以上になる最小サイズ（上段・下段とも。高さクランプはしない）
el.style.setProperty('--fs-ghost-top', fs_top + 'px'); el.style.setProperty('--fs-ghost-bottom', fs_bottom + 'px')
```

  **縦は溢れさせる**（03-review §7-1）: 親（sticky 100dvh）に `overflow: hidden`。下段のベースラインを `bottom: 6vh` に固定し（`position: absolute; bottom: 6vh`）、上段はその上に `line-height .9` で積む（上端で見切れてよい。lusion 画像 22 の `CREATIVE` と同じ）。`tail` 行は上段のさらに上に置き、上段の上端が sticky の上端を超える（= tail が見えない）場合は描画しない。
  計算例（1512×827）: `未来を創る`（emW ≈ 5）→ `max(272, 348)` = 348px（幅 1740px = 115vw）。`働く` / `環境`（emW ≈ 2）→ 各 870px（幅 1740px = 115vw）、2 行合計 ≈ 1566px = 189vh。下段 `環境` はベースライン bottom 6vh、上段 `働く` は上半分が画面上端で見切れる。`tail` は非表示。`US`（emW ≈ 1.35）→ 1288px、`CONTACT` → 348px 前後、同様に下段基準で積む。
- 見切れる末尾（`tail` = `Welcome to Linkle` 等）: 上段の**さらに上**に同じスタイルで置き、`transform: translateY(-.55em)`（下 45% だけ見える）。
- スクロール: 上段 `translateX(-4vw → +4vw)`、下段 `+3vw → -3vw`（p 0→1）でわずかに視差。`GridLayer`（z 1）はスクロール内容（z 2）の下にあるため文字の上には出ない。**文字の上を方眼が通る**ようにするため、このセクションだけ `GiantGhostText` の後ろに `repeating-linear-gradient` の方眼をもう 1 枚 `z-index: 2` で重ねる（`pointer-events: none`、`--bp-grid-minor`）。
- RM: 視差なし。SP: 下限を 24vw（`--fs-ghost-min: 24vw`）にし、同じフィット計算を行う。

### G13 配管（液体チューブ）（`gimmicks/LiquidTube.js` + `TubeController.js`）

- 技術: `position: fixed; left: 50%; top: 0; height: 100vh; width: 160px; translateX(-50%)` の `<svg>` 1 枚。中に `<defs>`: goo フィルタ（`feGaussianBlur stdDeviation=10` → `feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"`）、液のグラデーション（`--bp-fluid-0 → -1 → -2`、縦）、管壁のハイライト用グラデーション。
- 要素: `#wall`（管壁: `rect` 幅 110、`rx 55`、`fill: #000`、`stroke: rgba(255,255,255,.55) 1px` の左右エッジを別 `rect` で描く）、`#fluid`（液: goo 対象グループ内の `rect` + `circle` × 3）、`#ticks`（目盛り: `line` を 40px ピッチで管の右側に、`--bp-dim`、`stroke-dasharray` で長短交互）、`#ring`（円環: `circle r=55 stroke-width=8`）。
- 状態（`TubeController` が合成し `gsap.quickSetter` で属性更新）:

```js
state = { mode: 'none' | 'glass' | 'fluid' | 'brand' | 'capsule' | 'ring', topY, bottomY, fillLevel(0..1), breakT(0..1) }
// ページは useTube(sectionRef, keyframes) を呼ぶ。keyframes: [{ at: p, ...state }]。TubeController は
// 各セクションの p を読み、現在 sticky 表示中のセクションの keyframes を線形補間して LiquidTube に渡す
// 例（Home）:
Team:  [{at:.55, mode:'glass', topY:0, bottomY:0}, {at:.80, mode:'glass', topY:0, bottomY:'49vh-42px'}]  // 円ボタンへ垂れる
Ghost: [{at:0, mode:'glass', bottomY:'100vh'}, {at:.6, mode:'fluid', fillLevel:1}]                          // 液が満ちる
Cards: [{at:0, mode:'brand', bottomY:'cardsTop - 24px'}]                                                     // ブランド面: 管がブランド色、縁のみ
Liquid:[{at:0, mode:'capsule', bottomY:'39vh'}, {at:.5, mode:'ring', topY:'-55px'}]                          // U 字 → 円環へ引き上がる
Wipe:  [{at:0, breakT:0}, {at:1, breakT:1}]                                                                  // メタボール分離（G18）
```

- 見た目: 黒面 `glass` = 管壁黒 + 白エッジ + 目盛り。`fluid` = 液 rect の `scaleY(fillLevel)`（origin top）。`brand` = 管壁 `fill: var(--bp-brand)`、エッジ `rgba(255,255,255,.9)`、目盛り `--bp-dim-dark`、液は非表示（lusion 同様、面と同色で縁だけ）。`capsule` = 管本体の下端に `circle r=55`（`#cap`）を表示して丸底にする（`rect` は `rx 0` の角なし。`scaleY` で丸みが潰れないよう、底の丸みは常に別要素 `#cap` が担う）。`ring` = `#ring` のみ、`topY` へ `translateY` で引き上げ。`bottomY` の変化は `rect` の `scaleY` で表現（`height` は固定 100vh、`transform-origin: top`）し、`#cap` は `translateY(bottomY)` で追従させる。
- RM: 各 keyframe を補間せずステップ切替。SP: 幅 72px、目盛りピッチ 32px、goo の `stdDeviation 6`。

### G14 白カード（`gimmicks/ExpertiseCards.js`）

- 技術: DOM + CSS。`display: grid; grid-template-columns: repeat(4, var(--bp-card-w)); gap: var(--bp-card-gap); justify-content: center`。カード `width: var(--bp-card-w); height: var(--bp-card-h); border-radius: var(--bp-card-r); background: #fff; padding: var(--bp-card-pad); box-shadow: none`。
- 階段 + 傾き: カード i の `transform: translateY(calc(-1 * i * var(--bp-card-step))) rotate(var(--tilt))`、`--tilt` = `[-0.5deg, 0.5deg, 1.0deg, 1.5deg][i]`（4 枚目が最大）。`track6` は `[-0.5, 0.5, 1.0, 1.5, 1.0, 0.5]`。`wide` は `rotate(0)` `translateY(0)`。
- 中身: 左上タイトル（`--fs-card-title-ja` / 欧文は `--fs-card-title`、500、uppercase）、右上 `PixelGlyph char=String(i+1) size=34`。項目 `--fs-card-item`、行高 52px、`border-bottom: 1px dotted var(--bp-rule-card)`。下部に `transform: rotate(180deg)` の `div`（左に `PixelGlyph`、右にタイトル）。
- 寸法線（B 案）: グリッドの上 24px に `DimensionLine axis="x" length=全幅 label="1.0°"`（`--bp-dim-dark`）。
- 出現: `useInView`（`amount: .4`）で各カード `opacity 0→1, y 40→0`、`d .7`、`delay i*.08`。
- `track6`（Service）: 横幅 `6 × 316 + 5 × 32 = 2056px` のトラックを sticky 内で `translateX(0 → -(trackW - (100vw - 2*margin)))` に p [.15, .85] で対応させる。
- `wide`（About のマップ / Contact のフォーム）: 幅 `calc(2 * var(--bp-card-w) + var(--bp-card-gap))`（= 664px）、高さ auto、傾きなし。
- RM: フェードのみ。`< 1024px`: `row4` は横スクロールのトラック（`overflow-x: auto; scroll-snap-type: x mandatory`、`touch-action: pan-x`、lenis の wheel と競合しないよう `data-lenis-prevent` を付ける）。SP: `--bp-card-w: 240px`、`PixelGlyph size=28`。

### G15 花火（`gimmicks/Fireworks.js`）— 旧 `+ × ○` 噴水の置き換え（2026-09）

- 技術: Canvas2D（`position: absolute; inset: 0`、DPR 上限 1.5、`z-index: 3`）。`rate: MotionValue`（0〜1）と `ref.burst()`。
- 構成: ロケット（下端 → 上部 20〜45% の頂点、白い尾）→ 閃光（0.18s）→ 火花（放射状 110 粒 / SP 70。3 割強は環状）。
- 色: 1 発ごとに白 + パレット `#fff23a #ff4fa3 #ff7a1a #c6ff4a #7b5cff #0b3a56` から 1〜2 色。火花のグリフは `+ × ○ ・`（DotGothic16）。
- 擬似コード:

```js
launch(): rockets.push({ x: W*rand(.25,.75), y: H+8, vy: -H*rand(.85,1.05), targetY: H*rand(.2,.45), colors })
frame(dt): acc += rate.get()*dt*.7; while (acc>=1) launch()          // rate=1 で約 1.4s に 1 発
  rocket: y += vy*dt; vy *= 1-.9*dt; if (y<=targetY || vy>-H*.12) explode()
  explode(): for 110: speed = min(W,H)*.34*(ring ? rand(.85,1) : rand(.25,1)); life = rand(1.1,1.9)
  spark: vy += 170*dt; vx,vy に空気抵抗; alpha = life/maxLife*1.4 × 明滅（後半のみ）
burst(): launch() を 0 / 220 / 480ms で 3 発（Contact 送信成功）
```

- 1 発目は Canvas の 50% が見えた瞬間（`useWrapperInView`）に即打ち上げ、積算を .35 に置いて次弾を約 0.9 秒後に出す。
- `LiquidSection` で `rate = useTransform(p, [0, .15, .7, 1], [0, 1, 1, 0])`。G18 でブランド面と一緒に上へ抜ける（Canvas は sticky ブランド面の子なので自然に隠れる）。
- RM: 弾けた直後の火花 3 発分を静止画として 1 回描いて停止。noGL: 影響なし（Canvas2D）。SP: 火花 70 粒 / 発、上限 360 粒、打ち上げ x は 20〜80%。

### G16 CONTINUE ピル（`ui/ContinuePill.js`）

- `position: fixed; left: 50%; bottom: var(--bp-continue-bottom); translateX(-50%)`、250×53、白、黒 13px、`letter-spacing: .12em`、`↓ CONTINUE TO SCROLL ↓`。両端の `↓` は `@keyframes bob { 50% { transform: translateY(3px) } }` 1.2s 交互。
- `visible = useTransform(p_liquid, [0, .1, .8, .9], [0, 1, 1, 0])`。クリックで `lenis.scrollTo(footerTop, { duration: 1.4 })`。RM: bob なし。SP: 220×48。

### G17 文字二重分割（`ui/SplitFlipText.js`）

- 構造: `span.char { display:inline-block; overflow:hidden; height:1em; line-height:1 }` の中に `span.a` `span.b` を縦に積む（`b` は `position:absolute; top:100%`）。`translateY(0 → -100%)` を文字ごとに `delay i*20ms`、`d .5`。
- `trigger='inview'`: `useInView` で 1 回。`'hover'`: 親ホバーで往復。`'both'`（CTA 見出し）: 進入で 1 回 + ホバーで往復。
- 色: `colorTop` / `colorBottom` を props で受ける。黒面: 上 `--bp-ink` / 下 `--bp-brand`。ブランド面: 上 `--bp-ink-dark` / 下 `--bp-white`。黒ピル `送信する` 内: 上 `#fff` / 下 `--bp-brand`。
- RM: 入れ替えなし（`a` のみ表示）。SP: 同じ。

### G18 ブランド面 → 白面 直線ワイプ（`gimmicks/SurfaceWipe.js`）

- 構造: 外側 `section`（**高さ 200vh**、`data-surface="brand"`、`position: relative`）。子は 2 つを**通常フロー**で並べる（負マージンは使わない）:
  1. `div.brand` — `position: sticky; top: 0; height: 100dvh; background: var(--bp-brand); z-index: 0`。液体セクション末尾のブランド面を引き継ぐ。
  2. `div.light` — `position: relative; height: 100dvh; background: #fff; z-index: 1`（白 61vh の `FooterReveal` + 帯 39vh の `NextPageBand` を内包）。
  section の先頭 100vh をスクロールする間、`div.brand` は sticky で画面に留まり、その後ろに続く `div.light` が下端から上がってきて sticky 面を覆う（境界は `div.light` の上辺 = 水平直線）。section の末尾 100vh で `div.light` が画面全体（白 61 + 帯 39）になる。
- `surfaceRegistry` への登録: `brand` = `section.top 〜 section.top + 100vh`、`light` = **`section.top + 100vh 〜 section.top + 161vh`**、`band` = `section.top + 161vh 〜 section.top + 200vh`（`div.light` の実 offsetTop ではなく、この計算値で登録する。ワイプ中の境界通過と一致させるため）。
- 液: `TubeController` に `breakT = p_wipe`（0→1）。`LiquidTube` は `breakT > 0` で goo グループ内の `circle` 3 個を `translateY(0 → 60px, 140px, 220px)` + `r 22 → 10` で千切れ落とし、`breakT .8→1` で `opacity 0`。`+ ×` はブランド面の子なので一緒に抜ける。
- 境界は直線（白面 `div` の上辺）。RM: 同じ（スクロール構造なので影響なし）。SP: 同じ。

### G19 フッター行マスク・リビール（`layout/FooterReveal.js` + `ui/RevealLines.js`）

- レイアウト: 白面 **`height: 61vh`（`min-height` ではなく固定。最終画面「白 61vh + 帯 39vh = 100vh」を崩さない）**、内容が溢れる場合は col2 の行送りを上記の縮小値へ、それでも溢れれば `Quick Links` ブロックを col1 の住所の下（ブロック間 40px）へ移す。`padding: 56px var(--bp-margin) 40px`、`display: grid; grid-template-columns: repeat(4, var(--bp-footer-pitch))`。col1 住所 4 行（17px / 行送り 27px、`--bp-ink-dark`）。col2 3 ブロック（SNS 4 行 / `Quick Links` + 5 リンク / `Contact` + 2 行 = 13 行）は **17px / 行送り 24px、ブロック間 40px** に確定（13 × 24 + 2 × 40 = 392px。上下 padding 56 + 40 を足して 488px ≤ 61vh = 504px @827。`< 900px` 高さのビューポートでは行送り 22px / ブロック間 32px に落とす）。col3〜4 に大見出し 3 行（`--fs-footer-h-ja`、行送り 1.3）+ 入力欄 510×65 r12 `--bp-field`（`placeholder="example@example.com"`、右端内側 `→` ボタン → `go('/contact?email=' + encodeURIComponent(v))`）。最下行 `© {year} Linkle Inc. All rights reserved.`（col1）/ `お問い合わせ` リンク（col4）。黒円 `↑` 57px を右マージンに最下行と同じ y（`lenis.scrollTo(0, { duration: 1.6 })`）。各カラム左端に 1px の縦ガイド線（`--bp-dim-dark`、高さ 100%）。
- SNS 4 件は既存 URL が `#` のため `<span>`（`--bp-ink-dark-muted`）で表示し、リンクにしない（デッドリンク回避。URL が決まり次第 `<a>` に戻す）。
- `RevealLines` 擬似コード:

```js
lines.map((line, r) => <div className="mask-line"><span className="line" style={{ '--r': r }}>{splitChars(line).map((c, k) => <span className="ch" style={{ '--j': hash(r,k) % 9 }}>{c}</span>)}</span></div>)
// CSS: .line { transform: translateY(110%); transition: transform .8s var(--bp-ease) calc(var(--r) * 90ms) }
//      .ch   { display:inline-block; transform: translateY(calc(var(--j) * 1px)); transition: transform .5s var(--bp-ease) calc(var(--r) * 90ms + .45s) }
//      .in .line { transform: none }  .in .ch { transform: none }     ← useInView(root: wrapper, amount: .3, once) で .in を付与
```

- RM: `.line` / `.ch` の transition を `opacity .2s` に差し替え。SP: 1 カラム（縦ピッチ 48px）、入力欄 `width: 100%`。

### G20 オーバースクロール → NEXT PAGE 自動遷移（`gimmicks/NextPageBand.js`）

- 帯 `--bp-band`、高さ 39vh、`data-surface="band"`。左上 `KEEP SCROLLING` / `TO LEARN MORE`（14px 2 行）、その下に次ページ名（50px、Zen Kaku Gothic New 500 / `News` は Instrument Sans）、右に `NEXT PAGE`（13px）+ 溝線 150×2（`--bp-trough`）+ `→`。溝線の上にプログレス線（`--bp-accent-on-black`、`scaleX(progress)`、origin left）。左下 `SheetNumber`。クロスヘアは `Crosshairs` に y 93vh を指示。
- 擬似コード:

```js
progress = 0; lastInput = 0
lenis.on('virtual-scroll', ({ deltaY }) => {
  if (phase !== 'IDLE') return
  if (scrollStore.scroll >= scrollStore.limit - 1 && deltaY > 0) { progress = min(1, progress + deltaY / 1500); lastInput = now() }
})
gsap.ticker.add(() => {
  if (now() - lastInput > 120 && progress < 1) progress = max(0, progress - .02)     // 減衰
  setLine(progress)                                                                    // scaleX
  if (progress >= 1 && !lock) { lock = true; go(nextPath) }
})
// タッチ: wrapper の touchmove で末尾かつ上方向スワイプなら deltaY = -movementY として同じ処理
```

- 満了で `go(nextPath)` → §2.5 経路 3。次ページ chunk は帯が `useInView` した時点で `import()` を先読みする。
- RM: 同じ（スクロール操作なので影響なし）。SP: 同じ（`deltaY / 1200`）。

### G21 ページ遷移: L 字の窓 → 黒 → ピクセル LOADING（`gimmicks/PageTransition.js` + `LWindow.js` + `PixelLoading.js`）

- CAPTURE（900ms）: `LWindow.mode='capture'`。初期 `scale 7, rotate 0`、窓の外は黒。`scale 7 → 1`、`rotate 0 → -8deg`、`ease: power3.inOut`。窓のパネルは `fill: #fff` を `opacity 0 → .85`（旧ページが白へ退色。帯は `#c0c0c0` に見えるよう `mix-blend-mode: normal` で `#fff .85` を重ねるだけ）。最後の 150ms で矩形 B を `#efefef` に。窓の外の黒には `GridLayer` と同じ方眼を `opacity .35` で重ねる。
- LOADING: 窓を `opacity 0`（120ms）→ `PixelLoading` 開始。`LOADING` 7 文字、各 5×7、文字間 1 ドット、ドット 4px + 隙間 2px（全体 ≈ 280×40）。`lit` を左の列から順に（列優先、文字を跨いで連続）15ms/点で 1 → 全点灯。点灯順は「プロッタが左から打つ」ため x 列 → y 行の順。全点灯後 200ms 保持 → `dispatch('DONE','LOADING')`。
- RESET → PRELOAD(short) → SPLIT → REVEAL（G1 と同じ）。
- RM: CAPTURE を黒 `opacity 0→1` 200ms、LOADING は全点即時点灯 300ms 保持。SP: L を `scale(.6)` 基準。

### G22 ヘッダーピルの遅延・色反転・速度ずれ（`layout/Header.js`）

- 初回: ピル群（円ボタン + 2 ピル）を `overflow: hidden; height: 45px` の窓に入れ、`translateY(100%) → 0`、`d .8`、開始は REVEAL 完了 + 1.2s（`phase === 'IDLE'` になってから `setTimeout 1200`）。ページ遷移後も同じ（REVEAL 完了ごと）。
- 色反転: ロゴ `color: var(--cur-logo)`（§1.6）。ピルの塗りは不変。
- 速度ずれ: `scrollStore.subscribe` で `vy = clamp(velocity * .3, -30, 30)`、`gsap.quickTo(pillGroup, 'y', { duration: .25, ease: 'power2.out' })(vy)`。停止で 0 へ戻る。窓の上下端でクリップされる。
- スクロール中の隠れ（速度ベース。停止時は全セクションでピル可視）: `hidden = Math.abs(scrollStore.velocity) > 6`。`hidden` になったらピル群を `translateY(-100%)`（300ms）。`Math.abs(velocity) < 1` が **150ms 連続**したら復帰（`translateY(0)`、300ms）。`direction` は使わない（lenis の `direction` は停止後も最後の値を保持するため）。ロゴは常時表示。

```js
let idleSince = null
scrollStore.subscribe(({ velocity }) => {
  if (Math.abs(velocity) > 6) { idleSince = null; setHidden(true) }
  else if (Math.abs(velocity) < 1) { idleSince ??= performance.now(); if (performance.now() - idleSince >= 150) setHidden(false) }
})
```
- RM: 速度ずれなし、遅延出現はフェード。SP: ピルは `LET'S TALK` を省略せず 2 つとも表示するが、`--bp-pill-h: 40px`、文字 12px、円ボタン 40px。

---

## 5. ページ別実装マップ

### 5.0 共通ルール

- 各ページのルート要素: `<article data-page="home">`。セクションは §3.6 のコンポーネントを上から順に並べる。
- **ヒーローのピン留め区間は全ページ 300vh**（外側 `HeroSection` = 400vh。最初の 100vh が G3 の表示、続く 300vh が G4 の p 0→1）。
- `Spacer`（100vh、透明、面は前セクションを継承）は「総スクロール ≥ 20 画面」を保証するために入れる。位置は下表のとおりで、増減しない。
- 白面フッター（61vh）+ 帯（39vh）は `FooterSection` = `SurfaceWipe`（**外側 200vh**: 前半 100vh がワイプ、後半 100vh が最終画面。§4 G18 の構造）に含める。G18 の外側高さと §5 各表の `FooterSection` 200vh は同じ値。
- クロスヘア y: 既定 49vh。`TeamSection` の p ∈ [.30, .70] で 22vh（移動 600ms）。`NextPageBand` が見えたら 93vh。`Crosshairs` は `crosshairBus.y`（MotionValue、vh 単位）を読む。
- シート番号 `[[ 0NN ]]`: ページ内でセクションを上から 001 から連番（Spacer は数えない。ヒーロー = 001、`FooterSection` は白面 + 帯で 2 枚）。`NextPageBand` の番号はそのページの最後の番号。
- 「高さ」列は外側 section の高さ。「p の範囲」列は主要ギミックが 0→1 になる区間。

### 5.1 `/`（Home.js）— 総スクロール 2,550vh（25.5 画面）

| # | セクション | 面 | 高さ | 主要コンポーネント / props | ギミック（p 範囲） |
|---|---|---|---|---|---|
| 001 | `HeroSection` | dark | 400vh | `HeroTitle lines=['LINKLE']`（ロゴ文言 `Linkle` を uppercase）/ `HeroMorph left=[Web制作で, 未来を創る, 最新の技術とデザインで、, お客様のビジネスを次のステージへ。] italicLeft=[3] right=[Linkleが、, あなたのアイデアを形にします。] italicRight` / `SCROLL TO EXPLORE` | G2 morph .10→.70、G3 は REVEAL 開始で再生、G4 .02→.60、pull .60→1 |
| 002 | `IntroSection` | dark | 200vh | `DiagonalIntro topLeft='私たちは、最新のWeb技術と…提供します。' italicPrefix='私たちは、' bottomRight='システム開発の…届けます。'` | G6（inview） |
| — | `Spacer` | dark | 100vh | — | — |
| 003 | `TeamSection` | dark | 300vh | 見出し `私たちの`（label）+ `強 み`（`--fs-section-ja`、字間 .5em）/ `MeterLabels sheet=3 coords={X 0084, Y 0405}` / `BlueCircleButton` rotate 0→180 / 右下段落 `お客様のビジネスを成功に導くための、3つの価値` / `useTube` glass .55→.80 / 前セクション末尾 `届けます。` を左下に灰（`--bp-ink-muted` .4）で p 0→.25 表示 | G7、G8、G9 reveal .05→.30、G13 導入、クロスヘア 22vh .30→.70 |
| 004 | `BrandsSection` | dark | 200vh | ラベル `サービス詳細`（`TLink to='/service'`）/ `MarqueeRows rows=[[レスポンシブデザイン, モダンな技術スタック, SEO最適化, UI/UXデザイン, パフォーマンス最適化, セキュリティ], [01 ヒアリング, 02 企画・提案, 03 デザイン, 04 開発, 05 テスト, 06 リリース], [企業サイト, ECサイト, Webアプリケーション, React, Vue.js]]` | G10 |
| — | `Spacer` | dark | 100vh | — | — |
| 005 | `ListSection` | dark | 200vh | `NumberedList items=services（title, description）stats=stats` | G11 |
| — | `Spacer` | dark | 100vh | — | — |
| 006 | `GhostSection` | dark | 250vh | `GiantGhostText top='Web制作で' bottom='未来を創る' tail='Welcome to Linkle'` / `useTube` fluid 0→.6 | G12、G13 |
| 007 | `CardsSection` | brand | 300vh | 巨大白 `未来を創る`（`--fs-giant` 相当、面の上端に重なる: `translateY(-.45em)`）/ ラベル `Linkle株式会社について` + `TLink '/about'` `会社概要を見る` / `ExpertiseCards layout='row4' cards=[{設立, [2025年1月], '1'}, {所在地, [東京・渋谷], '2'}, {従業員数, [20名], '3'}, {事業内容, [Web制作/プラットフォーム運営], '4'}]` / `useTube` brand（bottomY = カード上端 − 24px） | G13、G14、G22 ロゴ黒 |
| 008 | `LiquidSection` | brand | 200vh | `useTube` capsule → ring（0→.5）/ `GlyphFountain rate` / `SplitFlipText text='プロジェクトを始めませんか？'`（2 行: `プロジェクトを` / `始めませんか？`）/ 段落 `お客様のビジョンを実現するため、まずはお気軽にご相談ください。` / `Pill dark` `無料相談する` → `/contact` / `ContinuePill` | G13、G15 .0→1、G16、G17 |
| 009–010 | `FooterSection` | brand→light→band | 200vh | `SurfaceWipe`（p 0→.5）/ `FooterReveal`（既存 Footer 文言）/ `NextPageBand nextLabel='会社概要' nextPath='/about' sheet=10` | G18、G19、G20 |
| — | （遷移） | — | — | `PageTransition` → `/about` | G21 |

シート番号の規則: 表の順に 001 から連番（Spacer は数えない）。`FooterSection` は白面フッター = 009、帯 = 010 の 2 枚と数える。コンセプト §2 #11 の `[[ 012 ]]` は例示であり、本書の連番規則（Home の帯 = `[[ 010 ]]`）を優先する。

### 5.2 `/about`（About.js）— 2,250vh（22.5 画面）

| # | セクション | 面 | 高さ | 主要コンポーネント / props | ギミック |
|---|---|---|---|---|---|
| 001 | `HeroSection` | dark | 400vh | `HeroTitle lines=['ABOUT','US']`（h1 `About Us`）/ `HeroMorph left=[会社概要, Our Mission, 最新のWeb技術とデザインを駆使し、, お客様のビジネスを成長させるソリューションを提供します。] italicLeft=[3] right=[Company Information, Linkle株式会社の基本情報]` | G2–G4 |
| 002 | `IntroSection` | dark | 200vh | `topLeft='私たちは、システム開発の…使命としています。' italicPrefix='私たちは、' bottomRight='技術への情熱と創造性を持って、…創造していきます。'` | G6 |
| — | `Spacer` | dark | 100vh | | |
| 003 | `TeamSection` | dark | 300vh | 見出し `Company Information`（2 行、字間 .5em、Instrument Sans）/ `MeterLabels sheet=3` / `BlueCircleButton` rotate 90→180（↓）/ 右下 `Linkle株式会社の基本情報` / `useTube` glass | G7–G9、G13 |
| 004 | `ListSection` | dark | 250vh | `NumberedList items=companyInfo.map(({label, value}) => ({title: label, description: value}))`（7 行。`所在地` の `\n` は `<br>`）/ 配管が中央を貫く（`useTube` glass bottomY 100vh） | G11、G13 |
| — | `Spacer` | dark | 100vh | | |
| 005 | `GhostSection` | dark | 250vh | `top='OUR' bottom='MISSION' tail='Our Mission'`（上段 `.skew-italic`）/ `useTube` fluid | G12、G13 |
| 006 | `CardsSection` | brand | 250vh | 巨大白 `MISSION` / ラベル `Access` + `アクセス情報` / `ExpertiseCards layout='wide' cards=[{title:'Access', items: <iframe …既存 src…>, glyph:'1'}]`、カード下に住所 2 行 | G13、G22 |
| 007 | `LiquidSection` | brand | 200vh | capsule → ring / `ContinuePill`（CTA 文なし、噴水なし） | G13、G16 |
| 008–009 | `FooterSection` | → | 200vh | `nextLabel='サービス' nextPath='/service' sheet=9` | G18–G20 |
| — | 遷移 → `/service` | | | | G21 |

### 5.3 `/service`（Service.js）— 2,450vh（24.5 画面）

| # | セクション | 面 | 高さ | 主要コンポーネント / props | ギミック |
|---|---|---|---|---|---|
| 001 | `HeroSection` | dark | 400vh | `lines=['OUR','SERVICES']` / `left=[Web制作サービス, 最高品質の, Web制作サービスを, 提供します] italicLeft=[3] right=[Our Features, 私たちが提供する6つの価値]` | G2–G4 |
| 002 | `IntroSection` | dark | 200vh | `topLeft='お客様のビジネスを成長させるため、…制作いたします。' bottomRight='企業サイト、ECサイト、…対応しています。'`（italicPrefix なし） | G6 |
| 003 | `TeamSection` | dark | 300vh | 見出し `Our Features` / `sheet=3` / rotate 0→180 / 右下 `私たちが提供する6つの価値` | G7–G9、G13 |
| 004 | `BrandsSection` | dark | 200vh | `MarqueeRows`（features タイトル / process `step + title` / 固有名詞 5 件） | G10 |
| — | `Spacer` | dark | 100vh | | |
| 005 | `ListSection` | dark | 250vh | `items=features`（6 行） | G11 |
| 006 | `GhostSection` | dark | 250vh | `top='DEVELOPMENT' bottom='PROCESS' tail='Development Process'` | G12、G13 |
| 007 | `CardsSection` | brand | 350vh | 巨大白 `PROCESS` / ラベル `品質を保証する開発フロー` / `ExpertiseCards layout='track6' cards=process.map(p => ({title: p.title, items:[p.description], glyph: p.step}))`（`PixelGlyph` は 2 桁 `01`〜`06` を 2 文字並べる） | G13、G14 |
| 008 | `LiquidSection` | brand | 200vh | capsule → ring / `ContinuePill` | G13、G16 |
| 009–010 | `FooterSection` | → | 200vh | `nextLabel='News' nextPath='/news' sheet=10` | G18–G20 |
| — | 遷移 → `/news` | | | | G21 |

### 5.4 `/news`（News.js）— 2,100vh（21 画面）

| # | セクション | 面 | 高さ | 主要コンポーネント / props | ギミック |
|---|---|---|---|---|---|
| 001 | `HeroSection` | dark | 400vh | `lines=['NEWS']` / `left=[最新情報を, お届けします, 最新の, ニュース・お知らせ] italicLeft=[3] right=[linkleの最新ニュースやお知らせを, こちらでご確認いただけます]` | G2–G4 |
| — | `Spacer` | dark | 100vh | | |
| 002 | `TeamSection` | dark | 300vh | 見出し `News`（字間 .5em）/ `sheet=2` / rotate 90→180（↓）/ 右下段落なし | G7–G9、G13 |
| 003 | `ListSection` | dark | 300vh | `currentNews.length > 0`: `NumberedList items=currentNews.map(n => ({meta: n.date, title: n.title, description: n.excerpt, to: '/news/'+n.id}))` + ページネーション（`001` `002` … の 44px ピル。現在ページ = 白ピル黒文字、他 = 黒ピル白文字 1px 枠 `--bp-dim`）。**空のとき**: `DiagonalIntro topLeft='お知らせはありません' bottomRight='現在、掲載中のニュース・お知らせはございません。'` | G11（空時 G6） |
| — | `Spacer` | dark | 100vh | | |
| 004 | `GhostSection` | dark | 250vh | `top='最新情報を' bottom='お届けします' tail='News'` | G12、G13 |
| 005 | `CardsSection` | brand | 250vh | 巨大白 `お届けします` / ラベル `最新情報を お届けします` + 段落 `linkleの最新ニュースやお知らせをこちらでご確認いただけます`（カードなし: `cards=[]` で `ExpertiseCards` を描かない） | G13、G22 |
| 006 | `LiquidSection` | brand | 200vh | capsule → ring / `ContinuePill` | G13、G16 |
| 007–008 | `FooterSection` | → | 200vh | `nextLabel='採用情報' nextPath='/recruit' sheet=8` | G18–G20 |
| — | 遷移 → `/recruit` | | | | G21 |

`ListSection` は 10 行 × 64px = 640px + ページネーション 80px が sticky 100dvh に収まる（827px 基準）。`< 768px` では sticky を外し `position: relative; height: auto` に切り替える（行が折り返して高さが伸びるため）。

### 5.5 `/recruit`（Recruit.js）— 2,150vh（21.5 画面）

| # | セクション | 面 | 高さ | 主要コンポーネント / props | ギミック |
|---|---|---|---|---|---|
| 001 | `HeroSection` | dark | 400vh | `lines=['RECRUIT']` / `left=[Recruit, 一緒に未来を創る, 仲間を, 募集しています] italicLeft=[3] right=[技術が大好きな, あなたへ]` | G2–G4 |
| 002 | `IntroSection` | dark | 200vh | `topLeft='Linkleでは、技術への情熱を持った仲間を募集しています。' bottomRight='新しい技術に興味を持ち、…届けていきましょう。'` | G6 |
| — | `Spacer` | dark | 100vh | | |
| 003 | `TeamSection` | dark | 300vh | 見出し `募 集 職 種`（字間 .5em）/ `sheet=3` / rotate 0→180 / 右下 `現在募集中のポジション` | G7–G9、G13 |
| 004 | `ListSection` | dark | 200vh | `items=[{title:'フルスタックエンジニア', description:'サーバーサイド/フロントエンド/…募集しています。'}]` | G11 |
| 005 | `GhostSection` | dark | 250vh | `top='働く' bottom='環境' tail='linkleで働く魅力'` | G12、G13 |
| 006 | `CardsSection` | brand | 300vh | 巨大白 `環境` / ラベル `linkleで働く魅力` / `ExpertiseCards layout='row4' cards=[...benefits.map((b,i) => ({title:b.title, items:[b.description], glyph:String(i+1)})), {title:'求める人材像', items:['技術が大好きな方', '新しい技術に興味を持ち、…重視します。'], glyph:'4'}]` | G13、G14 |
| 007 | `LiquidSection` | brand | 200vh | 噴水 / `SplitFlipText '一緒に働きませんか？'` / 段落 `ご質問やカジュアル面談のご希望など、お気軽にお問い合わせください` / `Pill dark` `お問い合わせ` → `/contact` / `ContinuePill` | G13、G15–G17 |
| 008–009 | `FooterSection` | → | 200vh | `nextLabel='お問い合わせ' nextPath='/contact' sheet=9` | G18–G20 |
| — | 遷移 → `/contact` | | | | G21 |

### 5.6 `/contact`（Contact.js）— 2,020vh（20.2 画面）

| # | セクション | 面 | 高さ | 主要コンポーネント / props | ギミック |
|---|---|---|---|---|---|
| 001 | `HeroSection` | dark | 400vh | `lines=['CONTACT','US']` / `left=[Contact Us, お気軽に, お問い合わせ, ください] italicLeft=[3] right=[ご質問やご相談は, お気軽にお問い合わせください]` | G2–G4 |
| — | `Spacer` | dark | 100vh | | |
| 002 | `TeamSection` | dark | 350vh | 見出し `Contact Us` / `sheet=2` / rotate 90→180（↓、フォームを指す）/ 右下段落なし | G7–G9、G13 |
| — | `Spacer` | dark | 100vh | | |
| 003 | `GhostSection` | dark | 350vh | `top='CONTACT' bottom='US' tail='Contact Us'` / `useTube` fluid | G12、G13 |
| 004 | `CardsSection`（`variant='flow'`: sticky を使わず通常フロー、`min-height: 100dvh`、上下 `padding: 12vh`） | brand | auto（≈ 120vh） | `ExpertiseCards layout='wide' cards=[{title:'Contact Us', items: <ContactForm/>, glyph:'1'}]`（§6.1） | G13（brand、bottomY = カード上端 − 24px）、G17（送信ピル） |
| 004' | 同カード（送信成功時に差し替え） | brand | — | `送信完了` / `お問い合わせありがとうございます。` / `担当者より折り返しご連絡いたします。` / `Pill dark` `新しいお問い合わせ`。差し替えの瞬間に `fountainRef.current.burst()` | G15（1 回） |
| — | `Spacer` | brand | 100vh | | |
| 005 | `LiquidSection` | brand | 300vh | capsule → ring / `GlyphFountain`（`rate` は 0 固定、`burst()` 専用）/ `ContinuePill` | G13、G16 |
| 006–007 | `FooterSection` | → | 200vh | `nextLabel='ホーム' nextPath='/' sheet=7` | G18–G20 |
| — | 遷移 → `/` | | | | G21 |

`GlyphFountain` は Contact では `CardsSection(flow)` の直後に置く `LiquidSection` 内にあるが、`burst()` は成功時にフォームカードの位置で噴かせたいので、Contact だけ `GlyphFountain` を `CardsSection(flow)` 内（カードの上、`position: absolute; inset: 0; z-index: 3`）にもう 1 枚置き、こちらで `burst()` を呼ぶ。

---

## 6. 既存機能の維持

### 6.1 Contact フォーム（react-hook-form + yup + EmailJS）

- `schema`、`useForm({ resolver: yupResolver(schema) })`、`onSubmit`（`process.env.REACT_APP_EMAILJS_*`、`templateParams`、`emailjs.send`、`setSubmitStatus`、`reset`）は**そのまま**。`isSubmitting` / `submitStatus` の状態も同じ。
- 追加: `const [params] = useSearchParams(); useEffect(() => { const e = params.get('email'); if (e) setValue('email', e) }, [])`（フッター入力欄からの引き継ぎ。`setValue` を `useForm` から取り出す）。
- マークアップ: `<form>` を `ExpertiseCards layout='wide'` のカード内に置く。`label`（`--fs-label` 相当ではなく 14px 500、`--bp-ink-dark`。必須 `*` は `--bp-ink-dark-muted`）、`select` / `input` / `textarea` は `height: 65px`（textarea は `min-height: 160px`）、`border-radius: 12px`、`background: var(--bp-field)`、`border: 1px solid transparent`、フォーカス `outline: 2px solid #000; outline-offset: 2px`、エラー時 `border-color: #c0392b` + 下に赤文字（既存メッセージ、14px）。`textarea` に `data-lenis-prevent`。
- 送信ボタン: `Pill dark` 幅 100%、`SplitFlipText text='送信する'`、`isSubmitting` 中は文言 `送信中...` + `aria-busy`、`disabled`。エラー: `送信に失敗しました。もう一度お試しください。` を `role="alert"` で。
- 成功表示: §5.6 004'。`react-icons`（FaCheck 等）は削除、代わりに `PixelGlyph char='1'` を見出しの右に置く。
- `option` の `value`（`service` / `recruit` / `press` / `other`）と表示文言は変更しない。

### 6.2 News（JSON + ページネーション）

- `import newsData from '../../data/news.json'`、`useState([])` + `useEffect(setNews)`、`itemsPerPage = 10`、`currentPage`、`slice` / `totalPages` は**そのまま**。
- 表示は `NumberedList`（§5.4）。行の `key={item.id}`。`item.excerpt` があれば説明列に。
- ページネーション: `Array.from({length: totalPages})` を `Pill`（44px 円）で描き、`onClick` で `setCurrentPage(page)` の後 `lenis.scrollTo(listSectionTop, { immediate: true })`。ボタンに `aria-current="page"`。
- `Link to={/news/${item.id}}` は `TLink` に置き換えて維持。**注意**: 既存でも `/news/:id` のルートは存在しない（現状の潜在バグ）。本設計では `App.js` に `<Route path="*" element={<Navigate to="/" replace />} />` を追加し、未定義ルートは `/` へ戻す（`Navigate` は `TransitionProvider` の popstate 経路で扱われる）。詳細ページの新設は**本設計の範囲外**。

### 6.3 Helmet

- `HelmetProvider` は `App.js` に残す。既存ページは `<Helmet>` を使っていないので、**新たに `<title>` 文言を追加しない**（テキスト追加禁止。`public/index.html` の `Linkle株式会社` がそのまま title）。
- 将来 PM がページ別 title を許可した場合は、各ページの h1 既存文言 + ` | Linkle株式会社` を `<Helmet><title>` に入れる、と明記しておく（今回は実装しない）。

### 6.4 ScrollTop

- `src/components/layout/ScrollTop.js` は削除。ルート変更時の先頭復帰は `TransitionProvider` の `RESET`（`lenis.scrollTo(0, { immediate: true })` + `wrapper.scrollTop = 0`）で行う。`window.scrollTo` は `html` が `overflow: hidden` のため無効化されるが、念のため `RESET` で併せて呼ぶ。

### 6.5 ルーティング・ナビ

- 6 ルートは不変。各ページは `React.lazy(() => import('./pages/Home/Home'))`、`<Suspense fallback={null}>`（LOADING / PRELOAD が画面を覆っているので fallback は不要）。
- ヘッダー既存 4 項目 + `お問い合わせ` は `MenuOverlay` に移り、`ニュース`（`/news`）を 004 として加える（PM 決定）。フッターの `Quick Links` 5 件は既存のまま `TLink`。
- `Footer.js` は `FooterReveal.js` に置き換える（文言は全件移植。`navItems` / `socialLinks` の配列は残す。`icon` プロパティのみ削除）。

### 6.6 EmailJS の環境変数・デプロイ

- `.env` の `REACT_APP_EMAILJS_SERVICE_ID / TEMPLATE_ID / PUBLIC_KEY` は変更しない。`npm run deploy`（S3 + CloudFront）はそのまま。CloudFront の SPA フォールバック設定は既存どおり（`/about` 直リンクは 403→`index.html` の既存挙動に依存）。

---

## 7. パフォーマンス予算

| 項目 | 予算 / 方針 |
|---|---|
| 粒子数（G2） | desktop 6,000 / SP 2,000。稜線 `LineSegments` は desktop のみ（約 11,800 セグメント、`uMorph < .05` で非表示） |
| 等高線（G9） | フルスクリーン 1 パス、`fwidth` 使用（`OES_standard_derivatives` は WebGL2 で標準）。ハローはシェーダ内加算、ポストプロセスなし |
| DPR | `dpr=[1, 1.5]`（SP は `[1, 1.25]`）。`useDetectGPU().tier <= 1` なら `1` |
| フレームループ | R3F `frameloop='always'` を可視シーン数 0 で `'never'` に切替（`useThree(s => s.setFrameloop)`）。各シーンは `useFrame` 冒頭で `if (!visible) return` |
| 可視判定 | 各セクションの `useInView(ref, { root: wrapper, margin: '100% 0px 100% 0px' })` を `sceneBus.visible[name]` に書く。`IntersectionObserver` の root は必ず wrapper |
| Canvas2D（G15） | 最大 500 粒（SP 220）。非可視で `cancelAnimationFrame` |
| `will-change` | `transform` を付けるのは: マーキー段、`#scroll-content`（付けない。lenis は scrollTop 方式なので不要）、ヒーロー文字 `span`、`LiquidTube` の `<svg>`、ピル群、`LWindow` の `<g>`。それ以外には付けない（レイヤ数を増やさない） |
| goo フィルタ（G13） | `<svg>` 幅 160px × 100vh に限定。`feGaussianBlur` の対象は液グループのみ。`filter` を `mode: 'glass' | 'brand'` では外す |
| 文字分割 | `HeroTitle` / `SplitFlipText` / `RevealLines` の `span` 総数を 1 画面で 600 以下 |
| 文字幅の計測 | `fitGiantFontSize`（G3）と `GiantGhostText`（G12）の `measureText` は `document.fonts.ready` 後に 1 回 + `resize`（debounce 150ms）ごと。計測は 1 枚の offscreen `<canvas>` を共有し、結果は `Map<font+text, emW>` にキャッシュ |
| バンドル | three + R3F + drei（必要 export のみ）+ lenis + gsap の追加を **gzip 後 +220KB 以内**。ページは `React.lazy` で分割。`drei` は `import { shaderMaterial } from '@react-three/drei/core/shaderMaterial'` のように個別 import |
| 初回ロード（プリローダー中に行うこと） | (1) `document.fonts.load` × 3、(2) `SceneCanvas` マウント + `gl.compileAsync`（シェーダのコンパイル）、(3) `terrain` 格子データ生成（Worker 不要、6,000 点で < 5ms）、(4) 現在ページ chunk の解決、(5) `surfaceRegistry.measure()`。目標: 通信が速い環境で `PRELOAD(full)` が `minDuration 1800ms` で律速すること（= 準備が 1.8s 以内に終わる） |
| ページ遷移 | `NextPageBand` 可視時に次ページ chunk を `import()` 先読み。`LOADING` 中に chunk が未解決なら `RESET` で待つ（最大 5s、超えたら `PRELOAD(short)` に進みつつ待つ） |
| 計測 | `reportWebVitals` を残し、`npm run build` 後に `build/static/js/*.js` の gzip サイズを実装ステップ 12 の完了条件で確認 |
| メモリ | ルート変更で `ParticleField` / `ContourField` の geometry は破棄せず再利用（Canvas が App 直下で生き続ける） |

---

## 8. 実装順序（依存関係順チェックリスト）

各ステップの完了条件に `npm run build` が含まれるものは、警告ゼロは求めないがエラーゼロを必須とする。

| # | ステップ | 主な成果物 | 完了条件 |
|---|---|---|---|
| 1 | 依存の入れ替え・フォント・CSS 変数・Tailwind | §1.1〜§1.7。`index.css` 全面書き換え、`index.html` の link、`App.css`/`logo.svg` 削除 | `npm run build` が通る。`grep -r "tsparticles\|Inter" src public` が 0 件。DevTools でフォント 3 種が読める |
| 2 | 骨格: `App.js` レイヤ、`SmoothScroll`（lenis）、`scrollStore`、`MotionPrefsProvider`、`surfaceRegistry`、`GridLayer`、`Spacer` | §2.1〜§2.4 | 6 ページがダミーの `data-surface` 付き 100vh × 3 ブロックで表示され、ホイールで慣性スクロールし、`html[data-theme]` が切り替わる |
| 3 | `TransitionProvider` 状態機械 + `TLink` + ルート `React.lazy` + `Navigate` | §2.5、§6.5 | phase が `BOOT→PRELOAD→…→IDLE` と遷移する（Preloader は仮の黒画面 + テキストで可）。リンククリックで `CAPTURE→LOADING→RESET→PRELOAD` を経てページが替わり、先頭に戻る |
| 4 | `Header` / `Pill` / `CircleButton` / `MenuOverlay` / `Crosshairs` / `ScrollIndicator` / `ContinuePill` / `BlueCircleButton` | §2.6、G8、G16、G22 | 面反転・速度ずれ・遅延出現が動く。MENU に 6 項目（`ニュース` 含む） |
| 5 | `LWindow` + `Preloader`（G1）+ `PageTransition` + `PixelLoading`（G21） | §4 G1 / G21 | 初回ロードとページ遷移の全シーケンスが本番の見た目で再生される。RM で短縮版になる |
| 6 | `SceneCanvas` + `ParticleField`（G2）+ Canvas2D フォールバック | §4 G2、§7 | ヒーローで粒子雲が動き、マウスに反発、`sceneBus.hero` を手で動かすとメッシュ化する。`webgl` を DevTools で無効化して 2D 版が出る |
| 7 | `HeroSection`: `HeroTitle`（G3）+ `HeroMorph`（G4）+ 6 ページ分の props | §4 G3 / G4、§5 | 6 ページ全部でヒーロー→タグライン着地が動く。`fitGiantFontSize` で 1512 幅時にキャップ ≈ 32vh |
| 8 | `IntroSection`（G6）、`MeterLabels`（G7）、`TeamSection` + `ContourField`（G9）+ クロスヘア 22vh | §4 G6 / G7 / G9 | Home で TEAM 相当が仕様書画像 18 と同じ配置になる |
| 9 | `LiquidTube` + `TubeController`（G13）、`SurfaceWipe`（G18）、`GhostSection`（G12） | §4 G12 / G13 / G18 | 配管が Team→Ghost→Cards→Liquid→Wipe を跨いで連続し、ワイプで液が千切れる |
| 10 | `MarqueeRows`（G10）、`NumberedList` + `StatBlock`（G11）、`ExpertiseCards` + `PixelGlyph` + `DimensionLine`（G14）、`SplitFlipText`（G17）、`GlyphFountain`（G15）、`LiquidSection` | §4 該当 | Home / Service / Recruit のブランド面が完成。`track6` の横流しが動く |
| 11 | `FooterReveal`（G19）、`NextPageBand`（G20）、`FooterSection` | §4 G19 / G20 | 末尾オーバースクロールで線が溜まり自動遷移。6 ページ巡回が一周する |
| 12 | 各ページの最終組み立て（§5 の順序・高さ・シート番号）、Contact フォーム移植（§6.1）、News（§6.2）、`Footer.js`/`ScrollTop.js` 削除、`react-icons` 削除 | §5、§6 | `npm run build` 通過。フォーム送信（成功 / 失敗 / バリデーション）が動き、成功時に噴水。News のページネーションが動く。`grep -r "react-icons" src` が 0 件。各ページの総スクロールが §5 の値（±5%）。gzip 合計が §7 予算内 |
| 13 | レスポンシブ（< 1024 / < 768）と RM / noGL の全項目確認 | §4 各項の SP / RM / noGL 行 | iPhone 幅で全ページが横スクロールなしで最後まで到達し NEXT PAGE が動く。`prefers-reduced-motion` で構造が保たれる |
| 14 | 仕上げ: フォーカスリング / ホバー / 押下、`aria-*`、`min-height: 100dvh`、z-index 直値 0 件、コメントアウト削除、§9 チェックリスト 25 項目の自己確認 | — | `grep -rn "z-\[\|zIndex: 9" src` が 0 件。§9 の 25 項目すべて YES |

---

## 9. チェックリスト対応表（仕様書 §5 の 25 項目）

| 項目 | 満たすコンポーネント / 挙動 |
|---|---|
| S1 面色の順序と限定 | `data-surface` は `dark / brand / light / band` の 4 値のみ（§2.4）。全ページの §5 表が黒→ブランド→白→帯の順。グラデーションは `LiquidTube` の液 `<linearGradient>` のみ。`box-shadow` は `ExpertiseCards` で `none` を明示。Lorem Ipsum なし（既存文言のみ） |
| S2 マージン / ヘッダー / クロスヘア / インジケータ | `--bp-margin` を全セクションの `padding-inline` に使用。`Header`（ロゴ + `CircleButton` + `Pill` × 2）は z 50 で常時固定（ピルの隠れは `|velocity| > 6` の間だけ、150ms 静止で復帰。停止時は常に可視）。`Crosshairs` 5 列（`--bp-cross-x0` + `--bp-cross-pitch`、中央列は 50%）、y は `crosshairBus`（49 / 22 / 93vh）。`ScrollIndicator` は右端 18px、ノブ色 `--cur-knob`（白面で黒） |
| S3 フォント・モノスペース・既存機能 | `tailwind.config.js` の `fontFamily` に Inter / Roboto / Arial / system-ui を含めない。数字・ラベルは `.text-num` / `.text-label`（JetBrains Mono）。§6 で文言・会社情報・フォーム・news.json・6 ルートを維持 |
| G1 | `Preloader` + `LWindow`: バー 212×45 + 目盛り、桁ロール、SPLIT で 2 矩形 → L、REVEAL で拡大回転ワイプ |
| G2 | `ParticleField`: 呼吸（snoise）、`uMouse` 反発、`uMorph` で地形メッシュへモーフ。noGL は `ParticleField2D` |
| G3 | `HeroTitle`: `span` 分割、`y 110% + rotate ±30°`、stagger 80ms、`fitGiantFontSize` でマージン内幅 100% / キャップ 32vh |
| G4 | `HeroMorph`: `HeroSection` 400vh（ピン留め 300vh）で `scaleX / skewX / translateX` の伸び歪み → 左 4 行 / 右 2 行へ `clip-path` 着地 |
| G5 | `SmoothScroll`（lenis lerp .08、`html,body overflow hidden`）。総スクロールは §5 で全ページ ≥ 20 画面 |
| G6 | `DiagonalIntro`: grid 対角セル、`splitBunsetsu` の文節 `span` を 40ms stagger |
| G7 | `MeterLabels`: `SheetNumber` / `Ruler` / `DotRow` / `DecodeLabel` の 4 種 |
| G8 | `BlueCircleButton`: fixed 中央 84px `--bp-brand`、矢印 `rotate` を p に連動 |
| G9 | `ContourField`: fbm 等高線 + シェーダ内ハロー。noGL は `ContourField2D`（marching squares + shadowBlur） |
| G10 | `MarqueeRows`: 3 段、偶数段 `animation-direction: reverse`、40s、ピッチ 196px |
| G11 | `NumberedList` / `NumberedRow`: `padStart(3,'0')` JetBrains Mono、点線罫 |
| G12 | `GiantGhostText fit='exceed'`: 行ごとに `max(18vw, 1.15 × 100vw ÷ emW)` を measureText で算出し、各行が画面幅を 15% 以上超える（高さクランプなし。下段ベースライン bottom 6vh、上段は sticky 上端で見切れてよい、親 `overflow: hidden`）。`--bp-ghost` on `#000`、`nowrap`、上に `tail` の見切れ（上段が上端を超える場合は非描画） |
| G13 | `LiquidTube`（fixed 中央）+ `TubeController`: Team → Ghost → Cards → Liquid → Wipe を跨いで連続。`mode: 'brand'` で最も強い |
| G14 | `ExpertiseCards layout='row4'`: 316×442 r16 影なし、`translateY(-i*6px) rotate(tilt)`、`PixelGlyph`、180° ミラー |
| G15 | `Fireworks`: Canvas2D 花火。打ち上げ → 上部 20〜45% で爆発、火花 110 粒/発（SP 70）、7 色パレット |
| G16 | `ContinuePill`: 250×53 白ピル、bottom 58px、`↓` bob |
| G17 | `SplitFlipText`: 文字二重、`translateY(-100%)` 20ms stagger、inview + hover |
| G18 | `SurfaceWipe`（外側 200vh）: sticky ブランド面の後ろに通常フローの白面 100dvh が続き、上がって覆う直線境界。液は `breakT` で千切れる |
| G19 | `FooterReveal` + `RevealLines`: 4 カラム `--bp-footer-pitch`、住所 / SNS + Quick Links + Contact / 大見出し + 入力欄 510×65 / クレジット、行 90ms + 文字 0〜8px、黒円 `↑` 57px |
| G20 | `NextPageBand`: `virtual-scroll` 累積 → `--bp-accent-on-black` の線 `scaleX` → `go(next)`。`KEEP SCROLLING / TO LEARN MORE`、次ページ名、`NEXT PAGE →` |
| G21 | `PageTransition` + `LWindow(capture)` + `PixelLoading`: 縮小回転 → 黒 → 5×7 ドット 15ms/点 → 次ページ `Preloader` |
| G22 | `Header`: REVEAL + 1.2s の下からマスク出現、`--cur-logo` 反転（ピル塗り不変）、`velocity * .3` の ±30px ずれ + 窓クリップ。隠れは速度ベース（`|velocity| > 6`）で停止時は可視 |

---

## 10. 決定事項と既知リスク

### 10.1 本書で確定した判断（コンセプトで未決だった点）

| 事項 | 決定 |
|---|---|
| MENU の `/news` ラベル | `ニュース`（PM 決定） |
| フッター SNS の `#` リンク | `<span>` 表示（リンクにしない）。URL 確定後に `<a>` へ |
| `/news/:id` の未定義ルート | 既存どおりリンクは残し、`*` ルートで `/` へ `Navigate`。詳細ページは範囲外 |
| bloom の実装 | 追加依存なし、シェーダ内ハロー加算 |
| 液体チューブの実装 | WebGL ではなく SVG goo + CSS（DOM）。三面をまたぐ固定要素として扱いやすく、noGL でも同一 |
| ページ別 `<title>` | 追加しない（テキスト追加禁止）。`HelmetProvider` は維持 |
| シート番号の連番 | §5.0 の規則（表の順に 001 から、Footer = 2 枚）。コンセプトの `[[ 012 ]]` 例示より規則を優先 |
| 審査（03-review）是正 | G12 行ごとフィット / G22 速度ベースの隠れ / G18 外側 200vh・通常フロー / G2 `aSize` + 柔らかい球 / G19 col2 行送り 24px・ブロック間 40px / G13 丸底は `#cap` 別要素 / G7 SP で DotRow を残す |
| React.StrictMode | 維持（副作用は全てクリーンアップ可能に書く） |

### 10.2 リスク

1. **lenis の wrapper 方式と `position: sticky` / `IntersectionObserver` の root 取り違え** — 全ての `useInView` / `whileInView` / `useScroll` に `root: wrapper` / `container: wrapperRef` を渡し忘れると「常に可視」や「進捗が動かない」になる。ステップ 2 の完了条件で最初に潰す。
2. **`Intl.Segmenter` の文節分割が期待と違う** — 助詞結合ルール（§4 G6）で吸収するが、`Segmenter` 未対応ブラウザ（Firefox < 125）では句読点分割のみになり、ステージ出現の粒度が粗くなる。許容（構造は同じ）。
3. **ヒーロー巨大文字のフォント計測タイミング** — `fitGiantFontSize` は `document.fonts.ready` 後に測る必要がある。PRELOAD で fonts を待つ設計なので REVEAL 時点では確定しているが、`resize` 時の再計測を忘れると幅が崩れる。
4. **iOS Safari のタッチスクロール** — `syncTouch: false` で OS 慣性に任せるため、`virtual-scroll` イベントがタッチで発火しない。G20 のタッチ経路（`touchmove` 累積）を別途実装する（§4 G20 に記載）。
5. **バンドル増** — three は tree-shaking が効きにくい。`import * as THREE` を避け、必要クラスのみ named import。予算 +220KB gzip を超えたら `drei` の import をさらに絞る。

---

## 11. lusion 実サイト（2026-09-28 録画）に基づく質感是正

lusion.co/about は仕様書（§1〜§3）作成時点から更新されている。ユーザー提供の画面録画（74.9 秒、1920×1080、60fps）を ffmpeg で 1fps / 10fps に切り出して測った値で、以下を是正した。構造・面色・寸法は変えていない。

| G | 変更 | 根拠（録画） |
|---|---|---|
| G2 粒子雲 | 球を 1.6 倍・グレー 0.55〜1.0 のばらつき・奥は薄く・3% をシアン。渦（中心ほど速い回転）を追加。メッシュ化で白く締まる | 灰色の泡状の雲がうねり、シアンの光が混ざる（0〜14s） |
| G4 変形 | 文字のゴム変形を p .02→.20 に圧縮（従来 .02→.35）。タグライン着地 p .10→.30。以降 .30→.82 は固定でドリーバック（`uPull` .3→.9、周辺減光 .3→.9）。p .82→.97 でタグラインが上の行から左へ流れ出る | 変形は最初のホイールで約 0.6s、7s の固定、退場は左へ（14〜22s） |
| G6 イントロ | セクション進捗 .72→.94 で 2 文が左へ流れ出る（`DiagonalIntro progress`）。sticky に `overflow: hidden` | 22〜27s |
| G9 等高線 | 本数 14 → 4（SP 3）、地形スケール 3 → 1.35、太い芯 + 広いハロー + 霧、線に沿う明滅（大半は薄く一部が強く光る）、下 35% の帯に集める、淡い青のティント、背景に縦のデジタルレイン（14% の列） | 27〜34s。太く少ない発光ライン、縦の筋 |
| G13 → G13' 虹色の帯 | **縦の配管（LiquidTube / TubeController）は廃止**（ユーザー指示: 中央の棒が邪魔）。代わりに黒面（BRANDS / リスト / 巨大文字）の背景に WebGL の `RibbonField`: 画面幅の水平な帯がカーソルの y に追従し、カーソルの x 付近で太く明るく、ノイズでうねる。縁が虹色（hue は x・帯内位置・時間で回る）、加算合成。`useRibbon(ref)` で可視セクション数を数えて ON/OFF | 44〜49s（カーソルを追う液体ガラスの帯） |
| G18' 黒→青の繋ぎ目 | 直線ワイプではなく**面全体のクロスフェード**。`GhostSection` の進捗 .86→.97 で背景 黒→ブランド色、巨大文字 `#14171b`→白、方眼・シート番号は消える。同じ白い文字がそのまま上へ流れて青面に続くので、`CardsSection` の頭の白い巨大文字（`giant`）は削除。面の登録はフェード中点でヘッダー線が brand に入るよう 2 分割 | 49.5〜50.0s（背景と文字色が約 0.5 秒で同時に変わる。硬い境界なし） |
| 002 の間 | `IntroSection` 200vh → 160vh、直後の `Spacer`（Home / About / Recruit）を削除 | ユーザー指摘（次セクションまでが長い） |
| SP 是正 | G12 の `tail` 行の位置を「上段 + 下段の高さ」ぶん上に修正（従来は上段に重なっていた。PC でも上段が崩れて見えていた原因）。SP では `CardsSection` の中身を上詰めにして、面がスクロールインした瞬間からカードが見えるように。SP のヘッダーは丸ボタンを省き、ロゴとピルの重なりを解消 | ユーザーの SP スクリーンショット（2026-09-28） |
| G1 プリローダーが開かない（不定期） | 原因: REVEAL 開始時に L 窓を state 更新で表示し、次フレームで ref を参照していたため、React の再描画が遅れると ref が null で処理が抜け `done('REVEAL')` が呼ばれず 100 + L 字で停止。是正: 窓を `phase === 'REVEAL'` から直接描画（同一コミットで ref が揃う）、ref が無ければ最大 60 フレーム再試行してから強制的に先へ。保険として `TransitionProvider` に監視タイマー（PRELOAD 15s / SPLIT・REVEAL・CAPTURE 6s / LOADING 8s）を追加し、超過時は警告を出して次フェーズへ。IDLE でプリローダーの overlay を必ず外す | ヘッドレスで PC / SP 各 6 回（低速回線を交互に）ロードし全て IDLE 到達 |
| G14 カード | 入場を「裏向きの束（中央）→ 扇状に定位置へ（`T.cardFan` .7s）→ 左から順に表へ裏返る（`T.cardFlip` .6s、.16s 間隔）」に。裏面はブランド色 + 白二重枠 + ドット地紋 + 中央円に 5×7 の `L` | 52〜55s |

未対応（アセットが必要 / 判断待ち）: ヒーローの月面・宇宙飛行士シーン、TEAM の点描ポートレート、CTA の図形リング（現状は花火を維持）。

### 11.x G13' リボン: SP / タブレットは画面中央に固定

- 現象: SP でリボンが画面上端（ヘッダー付近）に寄る。タップ時にブラウザが互換 `mousemove` を発火し、その座標（多くはヘッダーのタップ位置）にリボンが追従したまま留まるため。
- 対応: `RibbonField` で `isTablet`（<1024px）のときはカーソルを無視し、縦は uv 0.5（画面中央）に固定。明るい膨らみだけ `0.5 + 0.22·sin(t·0.35)` で左右にゆっくり流す。RM は従来どおり中央静止。
- 検証: ヘッドレス（390×844 / 820×1180、ヘッダーを tap してから）で、黒面の間ずっと中央に出ることをフレームで確認。

### 11.x 008 LiquidSection: lusion "Let's work together!" 面と同じ仕様へ（録画 2026-09-28 23.44.54）

- **G15 花火 → G15' 粒子の液体 `gimmicks/DotLiquid.js`（Canvas2D）**。白いグリフ粒（○ ■ ▲ + ×、間隔 17px / SP 15px、最大 2600 / SP 1100）が画面下部（高さの 38% / SP 30%）に溜まる。Verlet 積分 + 空間ハッシュの分離拘束（最小距離 = 間隔）で砂・液体の質感。カーソルの速度に引きずられて軌跡に沿った帯で噴き上がり（速度結合 ×30、上向き 4200·k、放射 1200+3000·k、半径 0.14H）、重力（2.6H/s²）で落ちて平らに戻る。持ち上がった塊の下に濃い青（rgba(8,60,110)）の影が 1.3 秒で消える。初回可視時に左→右へ 1.1 秒の波を一度通す。`ref.burst()`（中央から全体噴き上げ）は維持。RM: 落ち着いた状態を 1 フレーム。
- **G17 SplitFlipText → G17' `ui/ScatterText.js`**。カーソルが触れた文字だけ x ±.14em / y ±.36em / 回転 ±30°（16% で ±180°）へ跳び、380ms 後にバネ（stiffness 360 / damping 13）で戻る。同じ文字の再ヒットは 750ms 抑止。`to` を渡すとリンクになり、ホバーで各行に下線が左から伸びる（`.bp-scatter--link .line::after`）。
- **レイアウト**: 中央寄せ・白文字。上に小ラベル（段落文を `text-label` で）、巨大見出し（Latin `clamp(44px, 8.5vw, 132px)` / JP `clamp(34px, 6.4vw, 96px)`）、その下にピル、下端に CONTINUE ピル。`fountain` / `fountainRef` props は廃止（液体は常に描く）。Contact フォームの送信完了花火（`Fireworks`）は別セクションなので継続。
- SP: CONTINUE ピルの文字が 2 行に折れていたので 11px / padding 18px / nowrap に。影の半径 0.085H・濃さ 0.2 に抑制。
- 検証: ヘッドレス（1512×827 / 390×844）で、進入波 → 沈静 → カーソル横断で縦に噴き上がる → 見出し横断で文字が跳ねる → 2 秒後に文字・粒とも復帰、をフレームで確認。

### 11.x 008 → 009 のスクロール: CTA を固定したまま白面が覆う（録画 2026-09-29 0.07.08）

- 録画: "Let's work together!" 面は見出し・粒が固定されたまま、白いフッター面が下端から直線で上がって覆う（約 1 画面ぶんのスクロール）。その後フッター（住所・リンク・ニュースレター）→ 黒い次ページ帯。CTA が先に流れて空の青面が続く間延びは無い。
- 変更前: LiquidSection 200vh（sticky 100vh）→ 内容がスクロールで上に流れ → FooterSection（SurfaceWipe）の空の青 sticky 100vh → 白面ワイプ。CTA 完成から白面まで約 2 画面ぶんの空白があった。
- 変更後: `LiquidSection` は `hold`（既定 100）で高さ `(hold+200)vh`、sticky は `hold+100vh` ぶん固定。`FooterSection` は既定 `overlap=true` → `SurfaceWipe` に `margin-top: -200vh`、自身のブランド面を透明・pointer-events none、section `z-index: 3`。白面は hold vh の時点から下端を上がり、200vh で CTA を完全に覆う（CTA の sticky 解除と同時）。`surfaceRegistry` は top が大きい範囲を優先するので、光面 / 帯の判定は SurfaceWipe の計算値が勝つ。
- CONTINUE ピル: 進入 30vh でフェードイン、白面が上がり始める hold vh から 30vh でフェードアウト。遷移先は白面（`[data-surface="light"]` のフッター）。
- Contact の `height="300vh"` は廃止（既定 hold）。
- 検証: ヘッドレス 1512×827 で s=109vh で白が下端 9vh、150vh で半分、200vh で全面 → 黒帯、の順を確認。
