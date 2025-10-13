import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaMobile, FaLaptopCode, FaSearch, FaPalette, FaRocket, FaShieldAlt } from 'react-icons/fa';

const Service = () => {
  const features = [
    {
      icon: <FaLaptopCode className="text-4xl" />,
      title: 'レスポンシブデザイン',
      description: 'スマートフォン、タブレット、PCなど、あらゆるデバイスに最適化されたWebサイトを制作します。',
    },
    {
      icon: <FaRocket className="text-4xl" />,
      title: 'モダンな技術スタック',
      description: 'React、Vue.jsなど最新のフレームワークを使用し、高速で保守性の高いWebサイトを構築します。',
    },
    {
      icon: <FaSearch className="text-4xl" />,
      title: 'SEO最適化',
      description: '検索エンジンで上位表示されるよう、SEOを考慮した構造とコンテンツで制作します。',
    },
    {
      icon: <FaPalette className="text-4xl" />,
      title: 'UI/UXデザイン',
      description: 'ユーザー体験を重視した、直感的で使いやすいインターフェースをデザインします。',
    },
    {
      icon: <FaMobile className="text-4xl" />,
      title: 'パフォーマンス最適化',
      description: '高速な読み込みとスムーズな動作を実現し、ユーザー満足度を向上させます。',
    },
    {
      icon: <FaShieldAlt className="text-4xl" />,
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

  return (
    <div className="min-h-screen pt-20">
      {/* Page Header */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6TTI2IDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0xMCAwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Our Services
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              最高品質のWeb制作サービスを提供します
            </p>
          </motion.div>
        </div>
      </section>

      {/* Service Description */}
      <section className="section-padding bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                Web制作<span className="text-gradient">サービス</span>
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                お客様のビジネスを成長させるため、最新の技術とデザインを駆使したWebサイトを制作いたします。
                企業サイト、ECサイト、Webアプリケーションなど、幅広いニーズに対応しています。
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding gradient-secondary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Our <span className="text-gradient">Features</span>
            </h2>
            <p className="text-xl text-gray-600">
              私たちが提供する6つの価値
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="card-modern p-8 group cursor-pointer"
              >
                <div className="text-primary mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Development <span className="text-gradient">Process</span>
            </h2>
            <p className="text-xl text-gray-600">
              品質を保証する開発フロー
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {process.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="card-modern p-6 h-full">
                    <div className="text-6xl font-bold text-primary/20 mb-4">
                      {item.step}
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-90"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center text-white"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-8">
              お気軽に
              <br />
              ご相談ください
            </h2>
            <p className="text-xl md:text-2xl mb-12 text-white/90">
              プロジェクトのご相談やお見積もりは無料です
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary px-12 py-5 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              お問い合わせ
              <FaArrowRight />
            </Link>
          </motion.div>
        </div>
      </section> */}
    </div>
  );
};

export default Service;
