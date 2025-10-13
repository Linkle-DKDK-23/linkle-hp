import React from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaBuilding, FaUsers, FaCalendar, FaUserAlt , FaRegMoneyBillAlt, FaConnectdevelop } from 'react-icons/fa';

const About = () => {
  const companyInfo = [
    { icon: <FaBuilding />, label: '会社名', value: 'Linkle株式会社' },
    { icon: <FaCalendar />, label: '設立', value: '2025年1月23日' },
    { icon: <FaUserAlt />, label: '代表者', value: '倉石楽生' },
    { icon: <FaMapMarkerAlt />, label: '所在地', value: '東京都渋谷区道玄坂1-12-1 渋谷マークシティ W22階' },
    { icon: <FaRegMoneyBillAlt />, label: '資本金', value: '8,000,000円' },
    { icon: <FaUsers />, label: '従業員数', value: '20名' },
    { icon: <FaConnectdevelop />, label: '事業内容', value: 'Web制作/プラットフォーム運営' },
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
              About Us
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              会社概要
            </p>
          </motion.div>
        </div>
      </section>

      {/* Company Info */}
      <section className="section-padding bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Company <span className="text-gradient">Information</span>
              </h2>
              <p className="text-xl text-gray-600">
                Linkle株式会社の基本情報
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {companyInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="card-modern p-6"
                >
                  <div className="flex items-start gap-4">
                    {info.icon && (
                      <div className="text-primary text-2xl mt-1">
                        {info.icon}
                      </div>
                    )}
                    <div className="flex-1">
                      <dt className="font-bold text-lg mb-2 text-gray-700">
                        {info.label}
                      </dt>
                      <dd className="text-gray-900 text-lg">{info.value}</dd>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section-padding gradient-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                Our <span className="text-gradient">Mission</span>
              </h2>
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8">
                最新のWeb技術とデザインを駆使し、
                <br className="hidden md:block" />
                お客様のビジネスを成長させるソリューションを提供します。
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                私たちは、システム開発のプロフェッショナル集団として、常にお客様の期待を超える価値を届けることを使命としています。技術への情熱と創造性を持って、お客様と共に未来を創造していきます。
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="section-padding bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gradient">Access</span>
            </h2>
            <p className="text-xl text-gray-600">アクセス情報</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <div className="card-modern overflow-hidden">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-96 flex items-center justify-center">
                <div className="text-center">
                  <FaMapMarkerAlt className="text-6xl text-primary mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Google Maps埋め込み予定</p>
                  <p className="text-sm text-gray-500 mt-2">
                    東京都渋谷区道玄坂1-12-1<br />
                    渋谷マークシティ W22階
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
