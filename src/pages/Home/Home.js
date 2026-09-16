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
  const services = [
    {
      title: 'Web開発',
      description: '最新技術を駆使した高品質なWebサイト・アプリケーションを開発',
    },
    {
      title: 'スピード',
      description: '迅速な開発と柔軟な対応で、ビジネスを加速',
    },
    {
      title: 'イノベーション',
      description: '革新的なアイデアで、新しい価値を創造',
    },
  ];

  const stats = [
    { number: '20+', label: 'チームメンバー' },
    { number: '99%', label: '顧客満足度' },
  ];

  // 文字マーキー 3 段（Service ページ既存文言の再配置。新規文言なし）
  const marqueeRows = [
    ['レスポンシブデザイン', 'モダンな技術スタック', 'SEO最適化', 'UI/UXデザイン', 'パフォーマンス最適化', 'セキュリティ'],
    ['01 ヒアリング', '02 企画・提案', '03 デザイン', '04 開発', '05 テスト', '06 リリース'],
    ['企業サイト', 'ECサイト', 'Webアプリケーション', 'React', 'Vue.js'],
  ];

  const companyCards = [
    { title: '設立', items: ['2025年1月'], glyph: '1' },
    { title: '所在地', items: ['東京・渋谷'], glyph: '2' },
    { title: '従業員数', items: ['20名'], glyph: '3' },
    { title: '事業内容', items: ['Web制作/プラットフォーム運営'], glyph: '4' },
  ];

  return (
    <article data-page="home">
      <HeroSection
        sheet={1}
        lines={['Linkle']}
        left={['Web制作で', '未来を創る', '最新の技術とデザインで、', 'お客様のビジネスを次のステージへ。']}
        italicLeft={[3]}
        right={['Linkleが、', 'あなたのアイデアを形にします。']}
        italicRight
      />
      <IntroSection
        sheet={2}
        topLeft="私たちは、最新のWeb技術とデザインを駆使し、お客様のビジネスを成長させるソリューションを提供します。"
        italicPrefix="私たちは、"
        bottomRight="システム開発のプロフェッショナル集団として、常にお客様の期待を超える価値を届けます。"
      />
      <Spacer />
      <TeamSection
        sheet={3}
        label="私たちの"
        heading="強み"
        paragraph="お客様のビジネスを成功に導くための、3つの価値"
        coords={{ x: 'X 0084', y: 'Y 0405' }}
        prevTail="届けます。"
      />
      <BrandsSection sheet={4} label="サービス詳細" labelTo="/service" rows={marqueeRows} />
      <Spacer />
      <ListSection sheet={5} items={services} stats={stats} />
      <Spacer />
      <GhostSection sheet={6} top="Web制作で" bottom="未来を創る" tail="Welcome to Linkle" />
      <CardsSection
        sheet={7}
        giant="未来を創る"
        label="Linkle株式会社について"
        labelTo="/about"
        labelLinkText="会社概要を見る"
        cards={companyCards}
        layout="row4"
      />
      <LiquidSection
        sheet={8}
        headingLines={['プロジェクトを', '始めませんか？']}
        paragraph="お客様のビジョンを実現するため、まずはお気軽にご相談ください。"
        pills={[
          { label: '無料相談する', to: '/contact', variant: 'dark' },
          { label: 'お問い合わせ', to: '/contact', variant: 'light' },
        ]}
        fountain
      />
      <FooterSection nextLabel="会社概要" nextPath="/about" sheet={10} />
    </article>
  );
};

export default Home;
