export const SITE = {
  url: 'https://linkle.group',
  name: 'Linkle株式会社',
  short: 'Linkle',
  email: 'one@linkle.group',
  guide: 'https://guide.linkle.group/read.html',
  founded: '2025-01-23',
  representative: '倉石楽生',
  postalCode: '171-0021',
  region: '東京都',
  locality: '豊島区',
  street: '西池袋2-36-1 ソフトタウン池袋913号',
  capital: '8,000,000円',
  members: '20名',
  /** 会社の公式プロフィールの URL（Google ビジネスプロフィール、SNS、求人媒体など）。登録したら追加する。構造化データの sameAs に出る。 */
  sameAs: [],
  /** GA4 の測定 ID（プロパティ「Linkle HP」）。gatag.txt の GTM-5HJ92WDB は、この測定 ID に送る Google タグの別名。 */
  ga: process.env.NEXT_PUBLIC_GA_ID ?? 'G-9MWQEBQ1P0',
};

export const NAV = [
  { href: '/service', label: '事業内容', key: 'service' },
  { href: '/construction-dx', label: '建設業向け', key: 'construction' },
  { href: '/works', label: '開発事例', key: 'works' },
  { href: '/about', label: '会社概要', key: 'about' },
  { href: '/recruit', label: '採用', key: 'recruit' },
];

export const SERVICES = [
  { id: 'system', name: '業務システム開発', en: 'System Development' },
  { id: 'fde', name: 'FDE', en: 'Forward Deployed Engineer' },
  { id: 'dx', name: 'DX支援・業務効率化', en: 'DX Support' },
  { id: 'web', name: 'Web制作', en: 'Web' },
];

/** 単独ページのない業種。業種ハブに掲載する。 */
export const OTHER_INDUSTRIES = [
  { name: '外構・エクステリア', d: '図面・プランと見積の連動、メーカー商材の発注と納期の管理。' },
  { name: '型枠工事', d: '型枠材の転用計画と在庫、加工場と現場の連携、数量の拾い。' },
  { name: '鉄筋工事', d: '加工帳の作成、加工場の工程と出荷、現場への搬入順の管理。' },
  { name: '左官', d: '職人の手配と出面、材料の使用量、小口工事の請求。' },
  { name: '屋根・板金', d: '現場調査の写真と見積、書類の作成、問い合わせが集中する時期の受付。' },
  { name: 'リフォーム', d: '引合から契約までの管理、多工種の協力会社の手配、アフター点検。' },
  { name: '土木', d: '工事書類と写真の管理、重機とダンプの稼働管理。' },
  { name: '舗装工事', d: '合材の手配、夜間工事の班編成、機械の回送。' },
  { name: '設備工事', d: '機器の発注と納期、保守点検の予定、修理依頼の受付と履歴。' },
  { name: '管工事・水道', d: '申請書類、緊急修理の受付と配車、材料の在庫。' },
  { name: '電気工事', d: '材料の拾いと単価の管理、小口で件数の多い工事の管理。' },
  { name: 'クレーン・重機', d: 'オペレーター付きの配車、作業時間の記録と請求、点検期限の管理。' },
  { name: '産廃収集運搬', d: 'マニフェストの管理、計量と請求、収集ルートと配車。' },
  { name: '交通誘導警備', d: '隊員の上下番の報告、現場への配置、資格者の配置管理。' },
  { name: '建機レンタル', d: '貸出・返却と日割りの請求、整備履歴、在庫の所在。' },
];
