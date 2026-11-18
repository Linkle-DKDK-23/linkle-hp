'use client';
import { useEffect, useRef, useState } from 'react';
import { SITE } from '@/lib/site';
import { sendMail, track, isEmail } from '@/lib/mail';
import { Arrow } from './ui';

const KINDS = ['システム開発の相談', '無料見本の依頼', 'FDEの相談', 'Web制作の相談', '採用について', 'その他'];

export default function ContactForm() {
  const [v, setV] = useState({ kind: '', name: '', email: '', company: '', message: '' });
  const [err, setErr] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const formRef = useRef(null), doneRef = useRef(null);

  useEffect(() => {
    const k = new URLSearchParams(location.search).get('kind');
    if (k && KINDS.includes(k)) setV(s => ({ ...s, kind: k }));
  }, []);
  useEffect(() => { if (status === 'done' && doneRef.current) { doneRef.current.focus(); doneRef.current.scrollIntoView({ block: 'center' }); } }, [status]);

  const set = k => e => setV({ ...v, [k]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    if (status === 'sending') return;
    const t = k => v[k].trim();
    const er = {
      kind: v.kind ? '' : 'お問い合わせ種別を選択してください',
      name: t('name') ? '' : 'お名前を入力してください',
      email: !t('email') ? 'メールアドレスを入力してください' : isEmail(t('email')) ? '' : '正しいメールアドレスを入力してください',
      message: t('message') ? '' : 'お問い合わせ内容を入力してください',
    };
    setErr(er);
    const bad = ['kind', 'name', 'email', 'message'].find(k => er[k]);
    if (bad) { formRef.current.querySelector(`[name=${bad}]`).focus(); return; }
    setStatus('sending');
    try {
      await sendMail({ name: t('name'), email: t('email'), company: t('company'), type: v.kind, message: t('message') });
      track('generate_lead', { method: 'contact', kind: v.kind });
      setStatus('done');
    } catch (e2) {
      console.error('送信エラー:', e2);
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <div className="cf-done" ref={doneRef} tabIndex={-1}>
        <h2 className="h2">送信しました</h2>
        <p className="body" style={{ marginTop: 16 }}>お問い合わせありがとうございます。担当者より折り返しご連絡いたします。</p>
        <p style={{ marginTop: 32 }}><a className="tl" href="/">トップへ戻る<Arrow /></a></p>
      </div>
    );
  }

  return (
    <form className="cf" noValidate onSubmit={submit} ref={formRef}>
      <fieldset>
        <legend>お問い合わせ種別<em>必須</em></legend>
        <div className="cf-kinds">
          {KINDS.map(k => (
            <label key={k}><input type="radio" name="kind" value={k} checked={v.kind === k} onChange={set('kind')} /><span>{k}</span></label>
          ))}
        </div>
        <p className="gd-err" role="alert">{err.kind}</p>
      </fieldset>
      <label>お名前<em>必須</em><input name="name" type="text" autoComplete="name" placeholder="山田 太郎" value={v.name} onChange={set('name')} aria-invalid={!!err.name} /></label>
      <p className="gd-err" role="alert">{err.name}</p>
      <label>メールアドレス<em>必須</em><input name="email" type="email" autoComplete="email" inputMode="email" placeholder="example@example.co.jp" value={v.email} onChange={set('email')} aria-invalid={!!err.email} /></label>
      <p className="gd-err" role="alert">{err.email}</p>
      <label>会社名<input name="company" type="text" autoComplete="organization" placeholder="株式会社〇〇" value={v.company} onChange={set('company')} /></label>
      <label>お問い合わせ内容<em>必須</em><textarea name="message" rows={6} placeholder="今の業務で困っていることを、分かる範囲でお書きください。" value={v.message} onChange={set('message')} aria-invalid={!!err.message} /></label>
      <p className="gd-err" role="alert">{err.message}</p>
      {status === 'error' && (
        <p className="cf-fail" role="alert">送信に失敗しました。お手数ですが、時間をおいてもう一度お試しいただくか、<a href={`mailto:${SITE.email}`}>{SITE.email}</a> まで直接ご連絡ください。</p>
      )}
      <button className="btn" type="submit" disabled={status === 'sending'}>{status === 'sending' ? '送信中…' : '送信する'}<Arrow /></button>
      <p className="gd-note">ご入力いただいた情報は、お問い合わせへの対応にのみ使用します。</p>
    </form>
  );
}
