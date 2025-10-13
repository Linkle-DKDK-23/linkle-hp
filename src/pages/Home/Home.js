import React, { useEffect, useState, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaCode, FaRocket, FaLightbulb } from 'react-icons/fa';

const Home = () => {
  const { scrollY } = useScroll();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);


  const services = [
    {
      icon: <FaCode className="text-4xl" />,
      title: 'Web開発',
      description: '最新技術を駆使した高品質なWebサイト・アプリケーションを開発',
    },
    {
      icon: <FaRocket className="text-4xl" />,
      title: 'スピード',
      description: '迅速な開発と柔軟な対応で、ビジネスを加速',
    },
    {
      icon: <FaLightbulb className="text-4xl" />,
      title: 'イノベーション',
      description: '革新的なアイデアで、新しい価値を創造',
    },
  ];

  const stats = [
    { number: '20+', label: 'チームメンバー' },
    { number: '99%', label: '顧客満足度' },
  ];

  // Floating particles configuration
  const particles = Array.from({ length: 300}, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  const textVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.2,
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    }),
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.5,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    }),
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900" />

          {/* Animated Gradient Orbs */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute w-[800px] h-[800px] bg-primary/30 rounded-full blur-3xl -top-40 -left-40"
            style={{
              x: mousePosition.x,
              y: mousePosition.y,
            }}
          />

          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-3xl top-1/2 -right-40"
            style={{
              x: -mousePosition.x * 0.5,
              y: -mousePosition.y * 0.5,
            }}
          />

          <motion.div
            animate={{
              scale: [1, 1.4, 1],
              rotate: [0, 180, 0],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute w-[700px] h-[700px] bg-purple-500/20 rounded-full blur-3xl bottom-0 left-1/3"
            style={{
              x: mousePosition.x * 0.3,
              y: mousePosition.y * 0.3,
            }}
          />

          {/* Floating Particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-white/20"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: particle.size,
                height: particle.size,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Grid Pattern Overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <motion.div
          style={{ opacity, scale }}
          className="container mx-auto px-4 relative z-10"
        >
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge with Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.8,
                type: "spring",
                stiffness: 100,
              }}
              className="mb-8"
            >
              <motion.span
                whileHover={{ scale: 1.1 }}
                className="inline-block px-6 py-3 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-medium border border-white/20 shadow-lg"
              >
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"
                />
                Welcome to Linkle
              </motion.span>
            </motion.div>

            {/* Main Heading with Letter Animation */}
            <div className="mb-8 overflow-hidden">
              <motion.div
                initial="hidden"
                animate="visible"
                className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight"
              >
                <div className="mb-4">
                  {'Web制作で'.split('').map((char, i) => (
                    <motion.span
                      key={i}
                      custom={i}
                      variants={letterVariants}
                      className="inline-block"
                      whileHover={{
                        scale: 1.2,
                        color: '#6ccaf1',
                        transition: { duration: 0.2 }
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </div>
                <div>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="inline-block"
                  >
                    <motion.span
                      animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent"
                      style={{
                        backgroundSize: '200% 100%',
                      }}
                    >
                      未来を創る
                    </motion.span>
                  </motion.span>
                </div>
              </motion.div>
            </div>

            {/* Description with Fade Animation */}
            <motion.div
              variants={textVariants}
              initial="hidden"
              animate="visible"
              custom={1}
              className="mb-12"
            >
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                最新の技術とデザインで、お客様のビジネスを次のステージへ。
                <br />
                <motion.span
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="inline-block mt-2 text-primary font-semibold"
                >
                  Linkleが、あなたのアイデアを形にします。
                </motion.span>
              </p>
            </motion.div>

            {/* CTA Buttons with Stagger Animation */}
            <motion.div
              variants={textVariants}
              initial="hidden"
              animate="visible"
              custom={2}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/contact"
                  className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-blue-500 text-white px-10 py-5 rounded-full font-semibold overflow-hidden shadow-2xl"
                >
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-primary"
                    initial={{ x: '100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative z-10">お問い合わせ</span>
                  <FaArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/service"
                  className="group inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md text-white px-10 py-5 rounded-full font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20 shadow-xl"
                >
                  サービス詳細
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats with Count Animation */}
            <motion.div
              variants={textVariants}
              initial="hidden"
              animate="visible"
              custom={3}
              className="grid grid-cols-2 gap-8 max-w-3xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1, y: -10 }}
                  className="text-center"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 1 + index * 0.2,
                      type: "spring",
                      stiffness: 200,
                    }}
                    className="relative"
                  >
                    <motion.div
                      className="text-3xl md:text-5xl font-bold text-white mb-2"
                      animate={{
                        textShadow: [
                          '0 0 20px rgba(108, 202, 241, 0.5)',
                          '0 0 30px rgba(108, 202, 241, 0.8)',
                          '0 0 20px rgba(108, 202, 241, 0.5)',
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {stat.number}
                    </motion.div>
                    <div className="text-sm md:text-base text-gray-400">{stat.label}</div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-white/60 text-sm font-medium">Scroll</span>
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-2">
              <motion.div
                animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-3 bg-primary rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section className="section-padding bg-white relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              私たちの
              <span className="text-gradient"> 強み</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              お客様のビジネスを成功に導くための、3つの価値
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="card-modern p-8 group"
              >
                <div className="text-primary mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section-padding gradient-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Linkle株式会社について
                </h2>
                <p className="text-xl text-gray-700 leading-relaxed mb-8">
                  私たちは、最新のWeb技術とデザインを駆使し、
                  お客様のビジネスを成長させるソリューションを提供します。
                  <br /><br />
                  システム開発のプロフェッショナル集団として、
                  常にお客様の期待を超える価値を届けます。
                </p>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-primary font-semibold text-lg hover:gap-4 transition-all"
                >
                  会社概要を見る
                  <FaArrowRight />
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="card-modern p-8 bg-white">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <span className="text-gray-600 font-medium">設立</span>
                      <span className="font-bold">2025年1月</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <span className="text-gray-600 font-medium">所在地</span>
                      <span className="font-bold">東京・渋谷</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <span className="text-gray-600 font-medium">従業員数</span>
                      <span className="font-bold">20名</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">事業内容</span>
                      <span className="font-bold">Web制作/プラットフォーム運営</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6TTI2IDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0xMCAwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center text-white"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-8">
              プロジェクトを
              <br />
              始めませんか？
            </h2>
            <p className="text-xl md:text-2xl mb-12 text-white/90">
              お客様のビジョンを実現するため、まずはお気軽にご相談ください。
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary px-12 py-5 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              無料相談する
              <FaArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
