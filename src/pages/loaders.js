/**
 * ルートごとの chunk ローダ（React.lazy と NEXT PAGE 先読みで共用。webpack が同一 chunk に解決する）
 */
export const pageLoaders = {
  '/': () => import('./Home/Home'),
  '/about': () => import('./About/About'),
  '/service': () => import('./Service/Service'),
  '/news': () => import('./News/News'),
  '/recruit': () => import('./Recruit/Recruit'),
  '/contact': () => import('./Contact/Contact'),
};

/** NEXT PAGE 巡回（コンセプト §3 共通の枠） */
export const NEXT_PAGE = {
  '/': { path: '/about', label: '会社概要' },
  '/about': { path: '/service', label: 'サービス' },
  '/service': { path: '/news', label: 'News' },
  '/news': { path: '/recruit', label: '採用情報' },
  '/recruit': { path: '/contact', label: 'お問い合わせ' },
  '/contact': { path: '/', label: 'ホーム' },
};

export const MENU_ITEMS = [
  { path: '/', label: 'ホーム' },
  { path: '/about', label: '会社概要' },
  { path: '/service', label: 'サービス' },
  { path: '/news', label: 'ニュース' },
  { path: '/recruit', label: '採用情報' },
  { path: '/contact', label: 'お問い合わせ' },
];

export const prefetchPage = (path) => {
  const l = pageLoaders[path];
  return l ? l().catch(() => null) : Promise.resolve(null);
};
