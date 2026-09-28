import React, { useState, useEffect } from 'react';
import newsData from '../../data/news.json';
import HeroSection from '../../components/sections/HeroSection';
import IntroSection from '../../components/sections/IntroSection';
import TeamSection from '../../components/sections/TeamSection';
import ListSection from '../../components/sections/ListSection';
import GhostSection from '../../components/sections/GhostSection';
import CardsSection from '../../components/sections/CardsSection';
import LiquidSection from '../../components/sections/LiquidSection';
import FooterSection from '../../components/sections/FooterSection';
import Spacer from '../../components/sections/Spacer';
import { useTransition } from '../../lib/transition/TransitionProvider';

const News = () => {
  const [news, setNews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { getLenis } = useTransition();

  useEffect(() => {
    setNews(newsData);
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNews = news.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(news.length / itemsPerPage);

  const goPage = (page, e) => {
    setCurrentPage(page);
    const lenis = getLenis();
    const section = e.currentTarget.closest('section');
    if (lenis && section) lenis.scrollTo(section, { immediate: true });
  };

  return (
    <article data-page="news">
      <HeroSection
        sheet={1}
        lines={['News']}
        left={['ニュース', 'Linkleの「いま」を、', 'いち早く', 'お届けします。']}
        italicLeft={[3]}
        right={['お知らせ・リリース・メディア掲載など', '最新情報はこちらから。']}
      />
      <Spacer />
      <TeamSection sheet={2} heading="News" coords={{ x: 'X 0084', y: 'Y 0405' }} arrow="down" />
      {currentNews.length > 0 ? (
        <ListSection
          sheet={3}
          height="300vh"
          items={currentNews.map((item) => ({
            key: item.id,
            meta: item.date,
            title: item.title,
            description: item.excerpt,
            to: `/news/${item.id}`,
            linkLabel: '詳細を見る',
          }))}
        >
          {totalPages > 1 && (
            <nav className="flex" style={{ gap: 8, marginTop: 40 }} aria-label="ページネーション">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                const current = currentPage === page;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={(e) => goPage(page, e)}
                    aria-current={current ? 'page' : undefined}
                    className="text-num"
                    style={{
                      width: 44, height: 44, borderRadius: '50%', fontSize: 12,
                      background: current ? '#fff' : '#000', color: current ? '#000' : '#fff',
                      border: `1px solid ${current ? '#fff' : 'var(--bp-dim)'}`,
                      transition: 'background-color 240ms var(--bp-ease), color 240ms var(--bp-ease), transform 120ms var(--bp-ease)',
                    }}
                  >
                    {String(page).padStart(3, '0')}
                  </button>
                );
              })}
            </nav>
          )}
        </ListSection>
      ) : (
        <IntroSection
          sheet={3}
          topLeft="まだお知らせはありません。"
          bottomRight="近いうちに、いいニュースをお届けします。"
        />
      )}
      <Spacer />
      <GhostSection sheet={4} top="Latest" bottom="News" tail="What's New" />
      <CardsSection
        sheet={5}
        height="250vh"
        label="Linkleの「いま」"
        paragraph="お知らせ・リリース・メディア掲載などを随時更新していきます。"
        cards={[]}
      />
      <LiquidSection
        sheet={6}
        headingLines={['気になることは、', '直接聞いてください。']}
        paragraph="取材・掲載のご相談もこちらから。"
        pills={[{ label: 'お問い合わせ', to: '/contact', variant: 'dark' }]}
      />
      <FooterSection nextLabel="採用情報" nextPath="/recruit" sheet={8} />
    </article>
  );
};

export default News;
