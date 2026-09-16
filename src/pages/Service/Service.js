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

const Service = () => {
  const features = [
    {
      title: 'レスポンシブデザイン',
      description: 'スマートフォン、タブレット、PCなど、あらゆるデバイスに最適化されたWebサイトを制作します。',
    },
    {
      title: 'モダンな技術スタック',
      description: 'React、Vue.jsなど最新のフレームワークを使用し、高速で保守性の高いWebサイトを構築します。',
    },
    {
      title: 'SEO最適化',
      description: '検索エンジンで上位表示されるよう、SEOを考慮した構造とコンテンツで制作します。',
    },
    {
      title: 'UI/UXデザイン',
      description: 'ユーザー体験を重視した、直感的で使いやすいインターフェースをデザインします。',
    },
    {
      title: 'パフォーマンス最適化',
      description: '高速な読み込みとスムーズな動作を実現し、ユーザー満足度を向上させます。',
    },
    {
      title: 'セキュリティ',
      description: '最新のセキュリティ対策を実装し、安全で信頼性の高いWebサイトを提供します。',
    },
  ];

  const process = [
    { step: '01', title: 'ヒアリング', description: 'お客様のニーズと目標を詳しくお伺いします' },
    { step: '02', title: '企画・提案', description: '最適なソリューションをご提案します' },
    { step: '03', title: 'デザイン', description: 'UI/UXを考慮したデザインを作成します' },
    { step: '04', title: '開発', description: '最新技術で高品質な実装を行います' },
    { step: '05', title: 'テスト', description: '徹底的な品質チェックを実施します' },
    { step: '06', title: 'リリース', description: '本番環境へのデプロイとサポート' },
  ];

  const marqueeRows = [
    features.map((f) => f.title),
    process.map((p) => `${p.step} ${p.title}`),
    ['企業サイト', 'ECサイト', 'Webアプリケーション', 'React', 'Vue.js'],
  ];

  return (
    <article data-page="service">
      <HeroSection
        sheet={1}
        lines={['Our', 'Services']}
        left={['Web制作サービス', '最高品質の', 'Web制作サービスを', '提供します']}
        italicLeft={[3]}
        right={['Our Features', '私たちが提供する6つの価値']}
      />
      <IntroSection
        sheet={2}
        topLeft="お客様のビジネスを成長させるため、最新の技術とデザインを駆使したWebサイトを制作いたします。"
        bottomRight="企業サイト、ECサイト、Webアプリケーションなど、幅広いニーズに対応しています。"
      />
      <TeamSection
        sheet={3}
        heading="Our Features"
        headingLines={['Our', 'Features']}
        paragraph="私たちが提供する6つの価値"
        coords={{ x: 'X 0084', y: 'Y 0405' }}
      />
      <BrandsSection sheet={4} rows={marqueeRows} />
      <Spacer />
      <ListSection sheet={5} height="250vh" items={features} />
      <GhostSection sheet={6} top="Development" bottom="Process" tail="Development Process" />
      <CardsSection
        sheet={7}
        height="350vh"
        giant="Process"
        label="品質を保証する開発フロー"
        layout="track6"
        cards={process.map((p) => ({ title: p.title, items: [p.description], glyph: p.step }))}
      />
      <LiquidSection sheet={8} />
      <FooterSection nextLabel="News" nextPath="/news" sheet={10} />
    </article>
  );
};

export default Service;
