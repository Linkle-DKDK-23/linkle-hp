import React from 'react';
import HeroSection from '../../components/sections/HeroSection';
import IntroSection from '../../components/sections/IntroSection';
import TeamSection from '../../components/sections/TeamSection';
import ListSection from '../../components/sections/ListSection';
import GhostSection from '../../components/sections/GhostSection';
import CardsSection from '../../components/sections/CardsSection';
import LiquidSection from '../../components/sections/LiquidSection';
import FooterSection from '../../components/sections/FooterSection';
import Spacer from '../../components/sections/Spacer';

const Recruit = () => {
  const benefits = [
    {
      title: '充実した環境',
      description: 'チームで成長できる環境があります',
    },
    {
      title: '学習支援',
      description: '技術書購入やセミナー参加を支援',
    },
    {
      title: 'フラットな組織',
      description: '意見を言いやすい風通しの良い環境',
    },
  ];

  const cards = [
    ...benefits.map((b, i) => ({ title: b.title, items: [b.description], glyph: String(i + 1) })),
    {
      title: '求める人材像',
      items: [
        '技術が大好きな方',
        '新しい技術に興味を持ち、常に学び続ける姿勢を持った方を歓迎します。経験よりも、技術への情熱と成長意欲を重視します。',
      ],
      glyph: '4',
    },
  ];

  return (
    <article data-page="recruit">
      <HeroSection
        sheet={1}
        lines={['Recruit']}
        left={['Recruit', '一緒に未来を創る', '仲間を', '募集しています']}
        italicLeft={[3]}
        right={['技術が大好きな', 'あなたへ']}
      />
      <IntroSection
        sheet={2}
        topLeft="Linkleでは、技術への情熱を持った仲間を募集しています。"
        bottomRight="新しい技術に興味を持ち、常に学び続ける姿勢を持った方を歓迎します。一緒に成長し、お客様に価値を届けていきましょう。"
      />
      <Spacer />
      <TeamSection
        sheet={3}
        heading="募集職種"
        paragraph="現在募集中のポジション"
        coords={{ x: 'X 0084', y: 'Y 0405' }}
      />
      <ListSection
        sheet={4}
        items={[{
          title: 'フルスタックエンジニア',
          description: 'サーバーサイド/フロントエンド/インフラ構築/デザイナー/PM/ディレクターなど、幅広く開発に携わっていただけるエンジニアを募集しています。',
        }]}
      />
      <GhostSection sheet={5} top="働く" bottom="環境" tail="linkleで働く魅力" />
      <CardsSection sheet={6} giant="環境" label="linkleで働く魅力" cards={cards} layout="row4" />
      <LiquidSection
        sheet={7}
        headingLines={['一緒に働きませんか？']}
        paragraph="ご質問やカジュアル面談のご希望など、お気軽にお問い合わせください"
        pills={[{ label: 'お問い合わせ', to: '/contact', variant: 'dark' }]}
        fountain
      />
      <FooterSection nextLabel="お問い合わせ" nextPath="/contact" sheet={9} />
    </article>
  );
};

export default Recruit;
