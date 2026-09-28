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

const About = () => {
  const companyInfo = [
    { label: '会社名', value: 'Linkle株式会社' },
    { label: '設立', value: '2025年1月23日' },
    { label: '代表者', value: '鳥澤祐介' },
    { label: '所在地', value: '東京都豊島区西池袋2-36-1\nソフトタウン池袋913号' },
    { label: '資本金', value: '8,000,000円' },
    { label: '従業員数', value: '20名' },
    { label: '事業内容', value: 'アプリ受託運営開発事業（Web制作特化）' },
  ];

  const address = companyInfo.find((info) => info.label === '所在地')?.value || '';
  const addressForMap = encodeURIComponent(address.replace(/\n/g, ' '));

  const accessCard = [{
    title: 'Access',
    glyph: '1',
    items: (
      <div style={{ height: 'min(38vh, 360px)', borderRadius: 12, overflow: 'hidden' }}>
        <iframe
          title="Google Map"
          src={`https://www.google.com/maps?q=${addressForMap}&output=embed`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    ),
  }];

  return (
    <article data-page="about">
      <HeroSection
        sheet={1}
        lines={['About', 'Us']}
        left={['会社概要', 'Our Mission', '速く、美しく、見つかるWebで、', 'ビジネスの勢いを最大化する。']}
        italicLeft={[3]}
        right={['Company Information', 'Linkle株式会社の基本情報']}
      />
      <IntroSection
        sheet={2}
        topLeft="私たちは、2025年に生まれた、Web制作に特化したクリエイティブチームです。"
        italicPrefix="私たちは、"
        bottomRight="速さ。フットワークの軽さと本気のクオリティで、期待の一歩先へ。"
      />
      <TeamSection
        sheet={3}
        heading="Company Information"
        headingLines={['Company', 'Information']}
        paragraph="Linkle株式会社の基本情報"
        coords={{ x: 'X 0084', y: 'Y 0405' }}
        arrow="down"
      />
      <ListSection
        sheet={4}
        height="250vh"
        items={companyInfo.map(({ label, value }) => ({ title: label, description: value }))}
      />
      <Spacer />
      <GhostSection sheet={5} top="Our" bottom="Mission" tail="Our Mission" />
      <CardsSection
        sheet={6}
        height="250vh"
        label="Access"
        paragraph="アクセス"
        cards={accessCard}
        layout="wide"
        extra={(
          <p className="m-0 text-center" style={{ marginTop: 20, fontSize: 'var(--fs-body)', lineHeight: 1.7, whiteSpace: 'pre-line', color: 'var(--bp-ink-dark-muted)' }}>
            {address}
          </p>
        )}
      />
      <LiquidSection
        sheet={7}
        headingLines={['一緒に、', '勢いをつくろう。']}
        paragraph="お仕事のご相談も、採用の話も。まずは気軽にどうぞ。"
        pills={[{ label: '無料で相談する', to: '/contact', variant: 'dark' }]}
      />
      <FooterSection nextLabel="サービス" nextPath="/service" sheet={9} />
    </article>
  );
};

export default About;
