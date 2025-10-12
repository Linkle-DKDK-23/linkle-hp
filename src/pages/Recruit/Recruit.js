import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaHeart, FaUsers, FaGraduationCap, FaHandshake, FaRocket } from 'react-icons/fa';

const Recruit = () => {
  const benefits = [
    {
      icon: <FaUsers className="text-3xl" />,
      title: '充実した環境',
      description: 'チームで成長できる環境があります',
    },
    {
      icon: <FaGraduationCap className="text-3xl" />,
      title: '学習支援',
      description: '技術書購入やセミナー参加を支援',
    },
    {
      icon: <FaHandshake className="text-3xl" />,
      title: 'フラットな組織',
      description: '意見を言いやすい風通しの良い環境',
    },
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
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-full mb-6">
              <FaRocket className="text-4xl" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Recruit
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              一緒に未来を創る仲間を募集しています
            </p>
          </motion.div>
        </div>
      </section>

      {/* Message Section */}
      <section className="section-padding bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                <span className="text-gradient">技術が大好き</span>な<br className="md:hidden" />
                あなたへ
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                linkleでは、技術への情熱を持った仲間を募集しています。
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                新しい技術に興味を持ち、常に学び続ける姿勢を持った方を歓迎します。
                一緒に成長し、お客様に価値を届けていきましょう。
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Position Section */}
      <section className="section-padding gradient-secondary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              募集<span className="text-gradient">職種</span>
            </h2>
            <p className="text-xl text-gray-600">
              現在募集中のポジション
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card-modern p-10 md:p-12"
            >
              <div className="flex items-start gap-6 mb-8">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <FaRocket className="text-3xl text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold mb-4">フルスタックエンジニア</h3>
                  <p className="text-xl text-gray-700 leading-relaxed">
                    フロントエンドからバックエンドまで、幅広く開発に携わっていただけるエンジニアを募集しています。
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FaHeart className="text-primary" />
                  求める人材像
                </h4>
                <div className="bg-gradient-to-br from-primary/5 to-blue-500/5 rounded-xl p-6">
                  <p className="text-2xl font-bold text-primary mb-3">
                    技術が大好きな方
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    新しい技術に興味を持ち、常に学び続ける姿勢を持った方を歓迎します。
                    経験よりも、技術への情熱と成長意欲を重視します。
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              働く<span className="text-gradient">環境</span>
            </h2>
            <p className="text-xl text-gray-600">
              linkleで働く魅力
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="card-modern p-8 text-center group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Details Sections */}
      <section className="section-padding gradient-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* 福利厚生 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card-modern p-8 md:p-10"
            >
              <h3 className="text-2xl md:text-3xl font-bold mb-6 text-primary">
                福利厚生
              </h3>
              <div className="bg-gray-50 rounded-xl p-6 md:p-8">
                <p className="text-gray-600 leading-relaxed">
                  ※ここに福利厚生の詳細を記載してください
                </p>
              </div>
            </motion.div>

            {/* 選考フロー */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="card-modern p-8 md:p-10"
            >
              <h3 className="text-2xl md:text-3xl font-bold mb-6 text-primary">
                選考フロー
              </h3>
              <div className="bg-gray-50 rounded-xl p-6 md:p-8">
                <p className="text-gray-600 leading-relaxed">
                  ※ここに選考フローの詳細を記載してください
                </p>
              </div>
            </motion.div>

            {/* 応募方法 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="card-modern p-8 md:p-10"
            >
              <h3 className="text-2xl md:text-3xl font-bold mb-6 text-primary">
                応募方法
              </h3>
              <div className="bg-gray-50 rounded-xl p-6 md:p-8 mb-8">
                <p className="text-gray-600 leading-relaxed">
                  ※ここに応募方法の詳細を記載してください
                </p>
              </div>
              <div className="text-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 btn-primary text-lg"
                >
                  応募する
                  <FaArrowRight />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding relative overflow-hidden">
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
              一緒に働きませんか？
            </h2>
            <p className="text-xl md:text-2xl mb-12 text-white/90">
              ご質問やカジュアル面談のご希望など、お気軽にお問い合わせください
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
      </section>
    </div>
  );
};

export default Recruit;
