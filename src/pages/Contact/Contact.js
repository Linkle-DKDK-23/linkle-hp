import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaCheck, FaEnvelope, FaUser, FaBuilding, FaPaperPlane } from 'react-icons/fa';
// import emailjs from '@emailjs/browser'; // EmailJS設定時に有効化

const schema = yup.object({
  type: yup.string().required('お問い合わせ種別を選択してください'),
  name: yup.string().required('お名前を入力してください'),
  email: yup
    .string()
    .email('正しいメールアドレスを入力してください')
    .required('メールアドレスを入力してください'),
  company: yup.string(),
  message: yup.string().required('お問い合わせ内容を入力してください'),
}).required();

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // EmailJSの設定（実際の値は環境変数から取得することを推奨）
      // await emailjs.send(...);

      // デモ用：実際の送信処理をコメントアウト
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSubmitStatus('success');
      reset();
    } catch (error) {
      console.error('送信エラー:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Contact Us
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              お気軽にお問い合わせください
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="section-padding bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {submitStatus === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card-modern p-12 text-center"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCheck className="text-4xl text-green-600" />
                </div>
                <h2 className="text-3xl font-bold mb-4">送信完了</h2>
                <p className="text-xl text-gray-600 mb-2">お問い合わせありがとうございます。</p>
                <p className="text-gray-600 mb-8">担当者より折り返しご連絡いたします。</p>
                <button
                  onClick={() => setSubmitStatus(null)}
                  className="btn-primary"
                >
                  新しいお問い合わせ
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="card-modern p-8 md:p-12"
              >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* お問い合わせ種別 */}
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3 text-lg">
                      <FaEnvelope className="text-primary" />
                      お問い合わせ種別 <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('type')}
                      className={`w-full px-5 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                        errors.type ? 'border-red-300' : 'border-gray-200'
                      }`}
                    >
                      <option value="">選択してください</option>
                      <option value="service">サービスについて</option>
                      <option value="recruit">採用について</option>
                      <option value="press">取材について</option>
                      <option value="other">その他</option>
                    </select>
                    {errors.type && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        {errors.type.message}
                      </p>
                    )}
                  </div>

                  {/* お名前 */}
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3 text-lg">
                      <FaUser className="text-primary" />
                      お名前 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      className={`w-full px-5 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                        errors.name ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="山田 太郎"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-2">{errors.name.message}</p>
                    )}
                  </div>

                  {/* メールアドレス */}
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3 text-lg">
                      <FaEnvelope className="text-primary" />
                      メールアドレス <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      className={`w-full px-5 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                        errors.email ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="example@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-2">{errors.email.message}</p>
                    )}
                  </div>

                  {/* 会社名 */}
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3 text-lg">
                      <FaBuilding className="text-primary" />
                      会社名
                    </label>
                    <input
                      type="text"
                      {...register('company')}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="株式会社〇〇"
                    />
                  </div>

                  {/* お問い合わせ内容 */}
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3 text-lg">
                      <FaPaperPlane className="text-primary" />
                      お問い合わせ内容 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register('message')}
                      rows="6"
                      className={`w-full px-5 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none ${
                        errors.message ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="お問い合わせ内容をご記入ください"
                    />
                    {errors.message && (
                      <p className="text-red-500 text-sm mt-2">{errors.message.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full btn-primary text-lg py-5 ${
                        isSubmitting
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          送信中...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <FaPaperPlane />
                          送信する
                        </span>
                      )}
                    </button>
                  </div>

                  {submitStatus === 'error' && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-xl text-center">
                      送信に失敗しました。もう一度お試しください。
                    </div>
                  )}
                </form>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
