# 刷新前の検索状況（2026-11-18 取得）

Search Console（プロパティ `https://linkle.group/`）、2026-10-20〜11-16 の28日間。

| 指標 | 値 |
|---|---|
| 表示回数 | 178 |
| クリック | 21 |
| 平均掲載順位 | 6.8 |

- 表示された検索語は、ほぼ社名（linkle株式会社 / 株式会社linkle / linkle など）。「建設」「システム開発」を含む語での表示は 0 件
- 表示されたページ: `/` 132、`/about` 61、`/news` 22、`/recruit` 18、`/contact` 15、`/service` 14
- サイトマップ: 6 URL を送信済み（エラー 0）。トップは「送信して登録されました」

## 接続方法

鍵ファイルは組織ポリシー（iam.disableServiceAccountKeyCreation）で作れないため、権限借用を使う。

```bash
gcloud auth print-access-token --account=linkleworks@gmail.com \
  --impersonate-service-account=hp-analytics@linkle-hp-analytics.iam.gserviceaccount.com \
  --scopes=https://www.googleapis.com/auth/webmasters,https://www.googleapis.com/auth/analytics.edit
```

API 呼び出しには `x-goog-user-project: linkle-hp-analytics` ヘッダーを付ける。

## GA4

- アカウント「Linkle」（accounts/416817435）のプロパティ「Linkle HP」（properties/564932285、測定 ID `G-9MWQEBQ1P0`）。2026-11-18 に mijfans アカウントから移行
- キーイベント: `generate_lead`（資料請求とお問い合わせの送信）
- カスタムディメンション: `method`（guide = 資料請求 / contact = お問い合わせ）、`kind`（お問い合わせ種別）
