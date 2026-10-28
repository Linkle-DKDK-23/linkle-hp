import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import seo from '../../content/seo.json';
import { buildHead } from '../../lib/seo/head.mjs';

/**
 * ルートに応じて <head> を差し替える（title / description / canonical / OGP / Twitter / JSON-LD）。
 * 初回表示の HTML にはビルド後に同じタグが書き込まれている（scripts/prerender-meta.mjs、data-rh 付き）ので、
 * クライアント遷移時は Helmet がそれらを置き換える。
 */
export default function Seo() {
  const { pathname } = useLocation();
  const path = pathname.replace(/\/+$/, '') || '/';
  const head = buildHead(seo, path);
  return (
    <Helmet>
      <title>{head.title}</title>
      {head.metas.map((m) => (
        <meta key={m.name || m.property} {...(m.name ? { name: m.name } : { property: m.property })} content={m.content} />
      ))}
      {head.links.map((l) => <link key={l.rel} rel={l.rel} href={l.href} />)}
      <script type="application/ld+json">{JSON.stringify(head.jsonLd)}</script>
    </Helmet>
  );
}
