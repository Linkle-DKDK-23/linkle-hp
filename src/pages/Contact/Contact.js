import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import emailjs from '@emailjs/browser';
import { useSearchParams } from 'react-router-dom';
import { motionValue } from 'framer-motion';
import HeroSection from '../../components/sections/HeroSection';
import TeamSection from '../../components/sections/TeamSection';
import GhostSection from '../../components/sections/GhostSection';
import CardsSection from '../../components/sections/CardsSection';
import LiquidSection from '../../components/sections/LiquidSection';
import FooterSection from '../../components/sections/FooterSection';
import Spacer from '../../components/sections/Spacer';
import GlyphFountain from '../../components/gimmicks/GlyphFountain';
import Pill from '../../components/ui/Pill';
import PixelGlyph from '../../components/ui/PixelGlyph';
import SplitFlipText from '../../components/ui/SplitFlipText';

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

const zeroRate = motionValue(0);

const labelStyle = { display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--bp-ink-dark)', marginBottom: 10 };
const requiredMark = <span style={{ color: 'var(--bp-ink-dark-muted)', marginLeft: 4 }}>*</span>;
const errorStyle = { color: '#c0392b', fontSize: 14, marginTop: 8, marginBottom: 0 };

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [params] = useSearchParams();
  const fountainRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const e = params.get('email');
    if (e) setValue('email', e);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // EmailJSの環境変数を取得
      const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
      const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

      // EmailJSのテンプレートパラメータ
      const templateParams = {
        to_email: 'one@linkle.group',
        from_name: data.name,
        from_email: data.email,
        company: data.company || '未記入',
        inquiry_type: data.type,
        message: data.message,
      };

      // EmailJSで送信
      await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      );

      setSubmitStatus('success');
      reset();
      if (fountainRef.current) fountainRef.current.burst();
    } catch (error) {
      console.error('送信エラー:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const form = (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col" style={{ gap: 24 }}>
      {/* お問い合わせ種別 */}
      <div>
        <label htmlFor="contact-type" style={labelStyle}>お問い合わせ種別{requiredMark}</label>
        <select id="contact-type" {...register('type')} className={`bp-field ${errors.type ? 'is-error' : ''}`} aria-invalid={!!errors.type}>
          <option value="">選択してください</option>
          <option value="service">サービスについて</option>
          <option value="recruit">採用について</option>
          <option value="press">取材について</option>
          <option value="other">その他</option>
        </select>
        {errors.type && <p style={errorStyle} role="alert">{errors.type.message}</p>}
      </div>

      {/* お名前 */}
      <div>
        <label htmlFor="contact-name" style={labelStyle}>お名前{requiredMark}</label>
        <input id="contact-name" type="text" {...register('name')} className={`bp-field ${errors.name ? 'is-error' : ''}`} placeholder="山田 太郎" aria-invalid={!!errors.name} />
        {errors.name && <p style={errorStyle} role="alert">{errors.name.message}</p>}
      </div>

      {/* メールアドレス */}
      <div>
        <label htmlFor="contact-email" style={labelStyle}>メールアドレス{requiredMark}</label>
        <input id="contact-email" type="email" {...register('email')} className={`bp-field ${errors.email ? 'is-error' : ''}`} placeholder="example@example.com" aria-invalid={!!errors.email} />
        {errors.email && <p style={errorStyle} role="alert">{errors.email.message}</p>}
      </div>

      {/* 会社名 */}
      <div>
        <label htmlFor="contact-company" style={labelStyle}>会社名</label>
        <input id="contact-company" type="text" {...register('company')} className="bp-field" placeholder="株式会社〇〇" />
      </div>

      {/* お問い合わせ内容 */}
      <div>
        <label htmlFor="contact-message" style={labelStyle}>お問い合わせ内容{requiredMark}</label>
        <textarea id="contact-message" {...register('message')} rows="6" data-lenis-prevent className={`bp-field ${errors.message ? 'is-error' : ''}`} placeholder="お問い合わせ内容をご記入ください" aria-invalid={!!errors.message} />
        {errors.message && <p style={errorStyle} role="alert">{errors.message.message}</p>}
      </div>

      {/* Submit Button */}
      <div style={{ paddingTop: 8 }}>
        <Pill type="submit" variant="dark" disabled={isSubmitting} aria-busy={isSubmitting} className="w-full justify-center" style={{ height: 56, opacity: isSubmitting ? 0.7 : 1 }}>
          {isSubmitting ? '送信中...' : <SplitFlipText text="送信する" colorTop="#fff" colorBottom="var(--bp-brand)" trigger="hover" />}
        </Pill>
      </div>

      {submitStatus === 'error' && (
        <p role="alert" className="m-0 text-center" style={{ color: '#c0392b', fontSize: 14 }}>
          送信に失敗しました。もう一度お試しください。
        </p>
      )}
    </form>
  );

  const success = (
    <div className="flex flex-col items-start" style={{ gap: 16 }}>
      <div className="flex items-center" style={{ gap: 16 }}>
        <h2 className="m-0 font-medium palt" style={{ fontSize: 'var(--fs-section-ja)', lineHeight: 1.1 }}>送信完了</h2>
        <PixelGlyph char="1" size={34} />
      </div>
      <p className="m-0" style={{ fontSize: 17, lineHeight: 1.7 }}>お問い合わせありがとうございます。</p>
      <p className="m-0" style={{ fontSize: 'var(--fs-body)', lineHeight: 1.7, color: 'var(--bp-ink-dark-muted)' }}>担当者より折り返しご連絡いたします。</p>
      <div style={{ marginTop: 16 }}>
        <Pill variant="dark" onClick={() => setSubmitStatus(null)}>新しいお問い合わせ</Pill>
      </div>
    </div>
  );

  return (
    <article data-page="contact">
      <HeroSection
        sheet={1}
        lines={['Contact', 'Us']}
        left={['Contact Us', 'お気軽に', 'お問い合わせ', 'ください']}
        italicLeft={[3]}
        right={['ご質問やご相談は', 'お気軽にお問い合わせください']}
      />
      <Spacer />
      <TeamSection sheet={2} height="350vh" heading="Contact Us" headingLines={['Contact', 'Us']} coords={{ x: 'X 0084', y: 'Y 0405' }} arrow="down" />
      <Spacer />
      <GhostSection sheet={3} height="350vh" top="Contact" bottom="Us" tail="Contact Us" />
      <CardsSection
        sheet={4}
        variant="flow"
        layout="wide"
        cards={[{ title: 'Contact Us', glyph: '1', items: submitStatus === 'success' ? success : form }]}
      >
        <GlyphFountain ref={fountainRef} rate={zeroRate} active={false} />
      </CardsSection>
      <Spacer surface="brand" />
      <LiquidSection sheet={5} height="300vh" />
      <FooterSection nextLabel="ホーム" nextPath="/" sheet={7} />
    </article>
  );
};

export default Contact;
