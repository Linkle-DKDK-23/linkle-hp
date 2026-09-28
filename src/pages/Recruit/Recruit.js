import React from 'react';
import HeroSection from '../../components/sections/HeroSection';
import IntroSection from '../../components/sections/IntroSection';
import TeamSection from '../../components/sections/TeamSection';
import ListSection from '../../components/sections/ListSection';
import GhostSection from '../../components/sections/GhostSection';
import CardsSection from '../../components/sections/CardsSection';
import LiquidSection from '../../components/sections/LiquidSection';
import FooterSection from '../../components/sections/FooterSection';

const Recruit = () => {
  const benefits = [
    {
      title: '裁量とスピード',
      description: '任せる、すぐやる、すぐ直す。意思決定が速いから、成長も速い。',
    },
    {
      title: '学習支援',
      description: '技術書・セミナー・カンファレンス参加を会社が支援。',
    },
    {
      title: 'フラットな組織',
      description: '肩書きより、いいアイデア。誰でも、誰にでも、言える。',
    },
  ];

  // 募集職種（現在募集中の 5 ポジション）
  const positions = [
    {
      title: 'モバイルエンジニア',
      description: 'iOS / Android アプリの設計・開発。Webと連動するサービスを、スマホの手触りまで一気につくる。',
    },
    {
      title: 'Webデザイナー',
      description: 'UI/UXからブランディングまで。「らしさ」を一目で伝えるデザインを、コードのすぐ隣で。',
    },
    {
      title: 'インフラエンジニア',
      description: 'AWSを中心としたクラウドの設計・運用。速くて落ちない基盤で、サービスの勢いを支える。',
    },
    {
      title: '【PM/PL】Webアプリエンジニア',
      description: '要件定義から設計・開発・リリースまでチームを牽引。自分でも手を動かすPM/PL。',
    },
    {
      title: 'セキュリティエンジニア',
      description: '脆弱性診断、セキュア設計、運用監視。攻めるサイトを、守りでも本格に。',
    },
  ];

  const cards = [
    ...benefits.map((b, i) => ({ title: b.title, items: [b.description], glyph: String(i + 1) })),
    {
      title: '求める人材像',
      items: [
        'つくることが好きな方',
        '新しい技術やデザインに好奇心があり、学び続けられる方。経験より、熱量と成長意欲を重視します。',
      ],
      glyph: '4',
    },
  ];

  return (
    <article data-page="recruit">
      <HeroSection
        sheet={1}
        lines={['Recruit']}
        left={['採用情報', '勢いのあるチームで、', '一緒に', '本気でつくろう。']}
        italicLeft={[3]}
        right={['つくることが好きな', 'あなたへ']}
      />
      <IntroSection
        sheet={2}
        topLeft="Linkleは、まだ小さい。だからこそ速いし、裁量も成長も手触りも、全部が近い。"
        italicPrefix="Linkleは、"
        bottomRight="経験より、熱量。「もっと良くしたい」が止まらない人と、働きたい。"
      />
      <TeamSection
        sheet={3}
        heading="募集職種"
        paragraph="現在募集中のポジション"
        coords={{ x: 'X 0084', y: 'Y 0405' }}
      />
      <ListSection sheet={4} height="250vh" items={positions} />
      <GhostSection sheet={5} top="働く" bottom="環境" tail="Linkleで働く" />
      <CardsSection sheet={6} label="Linkleで働く魅力" cards={cards} layout="row4" />
      <LiquidSection
        sheet={7}
        headingLines={['一緒に、', '働きませんか？']}
        paragraph="カジュアル面談からでも。まずは気軽に話しましょう。"
        pills={[{ label: 'カジュアル面談を申し込む', to: '/contact', variant: 'dark' }]}
      />
      <FooterSection nextLabel="お問い合わせ" nextPath="/contact" sheet={9} />
    </article>
  );
};

export default Recruit;
