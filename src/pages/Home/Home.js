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

const Home = () => {
  // 3 つの武器: デザイン力 / スピード / 本格SEO
  const strengths = [
    {
      title: 'デザイン力',
      description: '「らしさ」を一目で伝えるUI/UX。若い感性と設計の裏付けで、記憶に残るサイトをつくる。',
    },
    {
      title: 'スピード',
      description: '意思決定から公開までを圧縮。小さく速く出して、数字を見ながら育てる。',
    },
    {
      title: '本格SEO',
      description: 'テクニカルSEOからコンテンツ設計まで。公開した瞬間から、検索で見つかる構造。',
    },
  ];

  const stats = [
    { number: '20+', label: 'チームメンバー' },
    { number: '99%', label: '顧客満足度' },
  ];

  // 文字マーキー 3 段
  const marqueeRows = [
    ['デザイン', 'スピード', '本格SEO', 'UI/UX', 'ブランディング', 'グロース'],
    ['01 ヒアリング', '02 企画・提案', '03 デザイン', '04 開発', '05 テスト・SEO実装', '06 公開・運用'],
    ['コーポレートサイト', 'LP', 'ECサイト', 'Webアプリ', 'React', 'Next.js', 'WordPress'],
  ];

  const companyCards = [
    { title: '設立', items: ['2025年1月'], glyph: '1' },
    { title: '所在地', items: ['東京・池袋'], glyph: '2' },
    { title: '従業員数', items: ['20名'], glyph: '3' },
    { title: '事業内容', items: ['Web制作 / アプリ受託運営開発'], glyph: '4' },
  ];

  return (
    <article data-page="home">
      <HeroSection
        sheet={1}
        lines={['Linkle']}
        left={['速い。美しい。', 'そして、見つかる。', 'デザイン、スピード、本格SEO。', '全部盛りのWeb制作チーム。']}
        italicLeft={[3]}
        right={['アイデアを、', '最速でカタチに。']}
        italicRight
      />
      <IntroSection
        sheet={2}
        topLeft="私たちは、デザインとスピードと本格SEOで、ビジネスを一気に前へ進めるWeb制作チームです。"
        italicPrefix="私たちは、"
        bottomRight="「なんかいい」で終わらせない。数字で勝つサイトを、最速で。"
      />
      <TeamSection
        sheet={3}
        label="Linkleの"
        heading="3つの武器"
        paragraph="見た目の良さ、公開までの速さ、公開後の伸び。どれも妥協しない。"
        coords={{ x: 'X 0084', y: 'Y 0405' }}
        prevTail="最速で。"
      />
      <BrandsSection sheet={4} label="事業内容を見る" labelTo="/service" rows={marqueeRows} />
      <Spacer />
      <ListSection sheet={5} items={strengths} stats={stats} />
      <Spacer />
      <GhostSection sheet={6} top="速く、美しく、" bottom="見つかる。" tail="Design × Speed × SEO" />
      <CardsSection
        sheet={7}
        label="Linkleについて"
        labelTo="/about"
        labelLinkText="会社概要を見る"
        cards={companyCards}
        layout="row4"
      />
      <LiquidSection
        sheet={8}
        headingLines={['そのアイデア、', '最速でカタチにしよう。']}
        paragraph="相談・見積りは無料。「まだふわっとしてる」段階でも大歓迎です。"
        pills={[
          { label: '無料で相談する', to: '/contact', variant: 'dark' },
          { label: 'お問い合わせ', to: '/contact', variant: 'light' },
        ]}
      />
      <FooterSection nextLabel="会社概要" nextPath="/about" sheet={10} />
    </article>
  );
};

export default Home;
