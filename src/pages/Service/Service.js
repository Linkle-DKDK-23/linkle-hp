import React from 'react';
import HeroSection from '../../components/sections/HeroSection';
import IntroSection from '../../components/sections/IntroSection';
import TeamSection from '../../components/sections/TeamSection';
import BrandsSection from '../../components/sections/BrandsSection';
import ListSection from '../../components/sections/ListSection';
import GhostSection from '../../components/sections/GhostSection';
import CardsSection from '../../components/sections/CardsSection';
import LiquidSection from '../../components/sections/LiquidSection';
import FooterSection from '../../components/sections/FooterSection';
import Spacer from '../../components/sections/Spacer';

/**
 * 事業内容（Service 01〜05）。番号付きの事業一覧 + 提供形態（01 / 02）で構成する。
 */
const Service = () => {
  const businesses = [
    {
      title: 'Webサイト制作事業',
      description: 'コーポレートサイト、LP、ECサイトまで。要件定義から企画・設計・デザイン・開発・テスト・公開・運用保守を一括で。デザイン力とスピード、公開初日から効く本格SEOを標準装備。',
    },
    {
      title: 'SEO・グロース支援事業',
      description: 'テクニカルSEO、コンテンツ設計、MEO、アクセス解析。「つくったのに見つからない」を、数字で解決する。',
    },
    {
      title: 'UI/UX・ブランディング事業',
      description: 'ロゴ、トンマナ、UI設計。「らしさ」を一目で伝えるビジュアルと、迷わせない体験をデザインする。',
    },
    {
      title: 'Webアプリ・システム開発事業',
      description: '業務のWeb化から新規サービスの立ち上げまで。React / Next.js を中心としたモダンな技術で、速く、壊れにくく。',
    },
    {
      title: '運用・伴走支援事業',
      description: '公開後こそ本番。改善サイクルを、チームの一員として回し続ける。\n01 スポット改善｜必要な時だけ、必要な分だけ。\n02 月額伴走｜毎月の改善サイクルをチームとして回す。',
    },
  ];

  const process = [
    { step: '01', title: 'ヒアリング', description: '課題とゴールを整理。「何をつくるか」より「なぜつくるか」から。' },
    { step: '02', title: '企画・提案', description: '戦略・構成・SEO設計をまとめてご提案。見積りもここで。' },
    { step: '03', title: 'デザイン', description: 'ブランドの「らしさ」を形に。UI/UXまで一気に。' },
    { step: '04', title: '開発', description: 'モダンな技術で、速く、壊れにくく実装。' },
    { step: '05', title: 'テスト・SEO実装', description: '全デバイス検証と、公開初日から効くSEOの最終チェック。' },
    { step: '06', title: '公開・運用', description: 'リリースして終わりじゃない。数字を見て、育て続ける。' },
  ];

  const marqueeRows = [
    businesses.map((b) => b.title),
    process.map((p) => `${p.step} ${p.title}`),
    ['コーポレートサイト', 'LP', 'ECサイト', 'Webアプリ', 'SEO', 'MEO', 'React', 'Next.js', 'WordPress'],
  ];

  return (
    <article data-page="service">
      <HeroSection
        sheet={1}
        lines={['Business']}
        left={['事業内容', 'Web制作を軸に、', 'つくる・届ける・伸ばすを', 'ワンストップで。']}
        italicLeft={[3]}
        right={['Our Business', '5つの事業領域']}
      />
      <IntroSection
        sheet={2}
        topLeft="「つくって終わり」にしない。設計・デザイン・開発から、SEO・運用・グロースまで一気通貫で伴走します。"
        bottomRight="一部の工程だけのご相談も歓迎。必要なところに、必要な分だけ。"
      />
      <TeamSection
        sheet={3}
        heading="Our Business"
        headingLines={['Our', 'Business']}
        paragraph="Web制作を軸にした、5つの事業領域。"
        coords={{ x: 'X 0084', y: 'Y 0405' }}
      />
      <BrandsSection sheet={4} rows={marqueeRows} />
      <Spacer />
      <ListSection sheet={5} flow heading="事業内容" subheading="Service 01 — 05" items={businesses} />
      <GhostSection sheet={6} top="Work" bottom="Flow" tail="How we work" />
      <CardsSection
        sheet={7}
        height="350vh"
        label="成果までの6ステップ"
        paragraph="ヒアリングから公開・運用まで、一気通貫で。"
        layout="track6"
        cards={process.map((p) => ({ title: p.title, items: [p.description], glyph: p.step }))}
      />
      <LiquidSection
        sheet={8}
        headingLines={['まず、', '話してみませんか？']}
        paragraph="「何から始めればいいか分からない」でOK。整理するところから一緒にやります。"
        pills={[{ label: '無料で相談する', to: '/contact', variant: 'dark' }]}
      />
      <FooterSection nextLabel="News" nextPath="/news" sheet={10} />
    </article>
  );
};

export default Service;
