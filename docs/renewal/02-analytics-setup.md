# Search Console / GA4 を API から操作できるようにする手順

Google Cloud の「サービスアカウント」（プログラム用の Google アカウント）を1つ作り、Search Console と GA4 にユーザーとして追加します。所要時間は15分ほどです。

## 1. サービスアカウントを作る

1. https://console.cloud.google.com/ を開き、プロジェクトを作成（名前の例: `linkle-hp-analytics`）
2. 「APIとサービス」→「ライブラリ」で次の3つを有効化
   - Google Search Console API
   - Google Analytics Admin API
   - Google Analytics Data API
3. 「IAMと管理」→「サービスアカウント」→「作成」（名前の例: `hp-analytics`）。ロールの付与は不要
4. 作成したサービスアカウントを開き、「キー」→「鍵を追加」→「新しい鍵を作成」→ JSON。ファイルがダウンロードされる
5. サービスアカウントのメールアドレス（`hp-analytics@….iam.gserviceaccount.com`）を控える

組織のポリシーでキー作成が禁止されている場合は、その旨を教えてください。別の方式（`gcloud auth application-default login`）に切り替えます。

## 2. Search Console に追加

1. https://search.google.com/search-console で `linkle.group` のプロパティを開く
2. 「設定」→「ユーザーと権限」→「ユーザーを追加」
3. 手順1-5のメールアドレスを入力し、権限は **フル**（サイトマップ送信に必要）

プロパティが無い場合は「ドメイン」タイプで `linkle.group` を追加してください（DNS の TXT レコードで確認）。ドメインタイプなら `guide.linkle.group` と `service.linkle.group` も同じプロパティで見られます。

## 3. GA4 に追加

1. https://analytics.google.com/ →「管理」
2. GA4 プロパティが無ければ作成（プロパティ名の例: `Linkle HP`）
3. 「アカウントのアクセス管理」→「＋」→「ユーザーを追加」
4. 手順1-5のメールアドレスを入力し、役割は **編集者**

## 4. キーファイルを置く

ダウンロードした JSON を、リポジトリの外に置いてください。

```
~/.config/linkle/hp-analytics.json
```

置いたら「置いた」とだけ伝えてください。JSON の中身をチャットに貼る必要はありません（貼らないでください）。

## これで出来ること

- Search Console: 検索語ごとの表示回数・順位・クリック数の取得、サイトマップ送信、インデックス状況の確認
- GA4: データストリームの作成、資料クリック・読了などのイベントとコンバージョンの設定、クロスドメイン計測（linkle.group / guide / service）の設定、レポート取得
