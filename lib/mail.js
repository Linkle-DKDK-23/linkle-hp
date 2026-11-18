import emailjs from '@emailjs/browser';
import { SITE } from './site';

/** EmailJS で one@linkle.group へ通知する。キーが未設定なら例外を投げる（送れていないのに成功表示しないため）。 */
export async function sendMail({ name, email, company, type, message }) {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  if (!serviceId || !templateId || !publicKey) throw new Error('mail-not-configured');
  await emailjs.send(serviceId, templateId, {
    to_email: SITE.email,
    from_name: name,
    from_email: email,
    company: company || '未記入',
    inquiry_type: type,
    message,
  }, publicKey);
}

/** GA4 のイベント。タグの読み込み前でも dataLayer に積まれ、読み込み後に送られる。 */
export function track(event, params = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  /* gtag は配列ではなく arguments オブジェクトを積む必要がある */
  (function gtag() { window.dataLayer.push(arguments); })('event', event, params);
}

export const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
