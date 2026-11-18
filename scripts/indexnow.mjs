// IndexNow: ページの更新を Bing などの検索エンジンに知らせる。
// out/sitemap.xml にある URL をまとめて送る。デプロイ（S3 同期と CloudFront 無効化）の後に実行する。
// キーは public/<キー>.txt として公開している（公開前提の値で、秘密ではない）。
//   node scripts/indexnow.mjs            送信する
//   node scripts/indexnow.mjs --dry-run  送る内容を表示するだけ
import { readFile, readdir } from 'node:fs/promises';

const HOST = 'linkle.group';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const dry = process.argv.includes('--dry-run');

const keyFile = (await readdir('public')).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('public/ に IndexNow のキーファイル（<32桁>.txt）がありません');
const key = keyFile.replace('.txt', '');
if ((await readFile(`public/${keyFile}`, 'utf8')).trim() !== key) throw new Error('キーファイルの中身がファイル名と一致しません');

const xml = await readFile('out/sitemap.xml', 'utf8');
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!urlList.length) throw new Error('out/sitemap.xml に URL がありません');

const keyLocation = `https://${HOST}/${keyFile}`;
if (dry) {
  console.log(`indexnow (dry-run): ${urlList.length} 件\n${urlList.join('\n')}`);
  process.exit(0);
}

// キーファイルが本番で読めない状態で送ると、キーが無効と記録されるので先に確かめる
const live = await fetch(keyLocation).then((r) => (r.ok ? r.text() : '')).catch(() => '');
if (live.trim() !== key) throw new Error(`${keyLocation} が本番で読めません。デプロイ後に実行してください`);

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key, keyLocation, urlList }),
});
// 200 = 受付、202 = 受付（キーの確認待ち）
if (res.status !== 200 && res.status !== 202) throw new Error(`IndexNow の送信に失敗しました: ${res.status} ${await res.text()}`);
console.log(`indexnow: ${urlList.length} 件を送信しました (${res.status})`);
