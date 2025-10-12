import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCalendar, FaChevronRight, FaNewspaper } from 'react-icons/fa';
import newsData from '../../data/news.json';

const News = () => {
  const [news, setNews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setNews(newsData);
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNews = news.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(news.length / itemsPerPage);

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
              <FaNewspaper className="text-4xl" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              News
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              最新のニュース・お知らせ
            </p>
          </motion.div>
        </div>
      </section>

      {/* News List */}
      <section className="section-padding bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {currentNews.length > 0 ? (
              <>
                <div className="space-y-6">
                  {currentNews.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      viewport={{ once: true }}
                    >
                      <Link
                        to={`/news/${item.id}`}
                        className="block group"
                      >
                        <div className="card-modern p-8 group-hover:shadow-2xl transition-all duration-300">
                          <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <div className="flex-shrink-0">
                              <div className="flex items-center gap-2 text-primary">
                                <FaCalendar />
                                <time className="text-sm font-medium">
                                  {item.date}
                                </time>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h2 className="text-xl md:text-2xl font-bold text-gray-800 group-hover:text-primary transition-colors mb-2">
                                {item.title}
                              </h2>
                              {item.excerpt && (
                                <p className="text-gray-600 line-clamp-2">
                                  {item.excerpt}
                                </p>
                              )}
                            </div>
                            <div className="flex-shrink-0">
                              <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all">
                                詳細を見る
                                <FaChevronRight className="text-sm" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex justify-center mt-16"
                  >
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-12 h-12 rounded-full font-semibold transition-all duration-300 ${
                            currentPage === page
                              ? 'bg-primary text-white shadow-lg scale-110'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card-modern p-16 text-center"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaNewspaper className="text-5xl text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  お知らせはありません
                </h3>
                <p className="text-gray-600 text-lg">
                  現在、掲載中のニュース・お知らせはございません。
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding gradient-secondary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              最新情報を
              <span className="text-gradient"> お届けします</span>
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              linkleの最新ニュースやお知らせをこちらでご確認いただけます
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default News;
