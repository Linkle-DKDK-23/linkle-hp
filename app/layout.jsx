import { IBM_Plex_Sans, IBM_Plex_Sans_JP } from 'next/font/google';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Effects from '@/components/Effects';
import GuideDialog from '@/components/GuideDialog';
import { JsonLd } from '@/components/ui';
import { SITE } from '@/lib/site';
import { orgLd } from '@/lib/seo';
import './globals.css';

const jp = IBM_Plex_Sans_JP({ weight: ['400', '500', '600'], subsets: ['latin'], display: 'swap', preload: false, variable: '--font-jp' });
const en = IBM_Plex_Sans({ weight: ['400', '500', '600'], subsets: ['latin'], display: 'swap', variable: '--font-en' });

export const metadata = {
  metadataBase: new URL(SITE.url),
  applicationName: SITE.name,
  icons: { icon: '/favicon.ico', apple: '/logo192.png' },
  formatDetection: { telephone: false },
  verification: {},
};
export const viewport = { themeColor: '#ffffff', width: 'device-width', initialScale: 1 };

const GA = SITE.ga;

export default function RootLayout({ children }) {
  return (
    <html lang="ja" className={`${jp.variable} ${en.variable}`} suppressHydrationWarning>
      <head>
        {/* ページ遷移の覆いを、描画前に閉じた状態にする */}
        <script dangerouslySetInnerHTML={{ __html: "try{if(sessionStorage.getItem('lk-pt'))document.documentElement.classList.add('pt')}catch(e){}" }} />
        <JsonLd data={orgLd} />
      </head>
      <body>
        <div id="cover"></div>
        <svg id="stage" aria-hidden="true"></svg>
        <Header />
        {children}
        <Footer />
        <GuideDialog />
        <Effects />
        {GA && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA}',{linker:{domains:['linkle.group','guide.linkle.group','service.linkle.group']}});`}</Script>
          </>
        )}
      </body>
    </html>
  );
}
