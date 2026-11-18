'use client';
import { useEffect, useRef, useState } from 'react';
import { SITE } from '@/lib/site';
import { sendMail, track, isEmail } from '@/lib/mail';
import { Arrow } from './ui';

const KEY = 'lk-guide';

/** 資料請求。代表者名・会社名・メールを入力すると資料が開く。入力内容はメールで通知する。 */
export default function GuideDialog() {
  const ref = useRef(null);
  const [v, setV] = useState({ name: '', company: '', email: '' });
  const [err, setErr] = useState({});
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const open = () => {
      let seen = false;
      try { seen = !!sessionStorage.getItem(KEY); } catch (e) {}
      if (seen) { window.open(SITE.guide, '_blank', 'noopener'); track('guide_open', { repeat: true }); return; }
      setDone(false);
      ref.current.showModal();
      track('guide_dialog_open', { page_path: location.pathname });
    };
    window.addEventListener('lk:guide', open);
    return () => window.removeEventListener('lk:guide', open);
  }, []);

  const set = k => e => setV({ ...v, [k]: e.target.value });

  const submit = e => {
    e.preventDefault();
    const name = v.name.trim(), company = v.company.trim(), email = v.email.trim();
    const er = {
      name: name ? '' : '代表者名を入力してください',
      company: company ? '' : '会社名を入力してください',
      email: !email ? 'メールアドレスを入力してください' : isEmail(email) ? '' : '正しいメールアドレスを入力してください',
    };
    setErr(er);
    const bad = ['name', 'company', 'email'].find(k => er[k]);
    if (bad) { ref.current.querySelector(`[name=${bad}]`).focus(); return; }
    /* 資料はクリックの直後に開く（待たせるとブラウザが新しいタブを止めるため）。通知は裏で送る。 */
    window.open(SITE.guide, '_blank', 'noopener');
    try { sessionStorage.setItem(KEY, '1'); } catch (e2) {}
    setDone(true); setBusy(true);
    track('generate_lead', { method: 'guide', page_path: location.pathname });
    sendMail({ name, email, company, type: '資料請求（資料を閲覧）', message: `資料を閲覧しました。\n閲覧元のページ: ${location.href}` })
      .catch(e3 => console.error('資料請求の通知に失敗:', e3))
      .finally(() => setBusy(false));
  };

  const field = (k, label, props) => (
    <>
      <label>{label}<input name={k} value={v[k]} onChange={set(k)} aria-invalid={!!err[k]} {...props} /></label>
      <p className="gd-err" role="alert">{err[k]}</p>
    </>
  );

  return (
    <dialog className="gd" ref={ref} aria-labelledby="gd-t" onClick={e => { if (e.target === ref.current) ref.current.close(); }}>
      <button className="gd-x" type="button" aria-label="閉じる" onClick={() => ref.current.close()}></button>
      {!done ? (
        <div>
          <p className="label"><span className="num">GUIDE</span>サービス資料</p>
          <h2 id="gd-t">資料をご覧いただけます</h2>
          <p className="gd-lead">代表者名・会社名・メールアドレスをご入力ください。送信後、すぐに資料が開きます。</p>
          <form noValidate onSubmit={submit}>
            {field('name', '代表者名', { type: 'text', autoComplete: 'name', placeholder: '山田 太郎' })}
            {field('company', '会社名', { type: 'text', autoComplete: 'organization', placeholder: '株式会社〇〇' })}
            {field('email', 'メールアドレス', { type: 'email', autoComplete: 'email', inputMode: 'email', placeholder: 'example@example.co.jp' })}
            <button className="btn" type="submit">資料を見る<Arrow /></button>
            <p className="gd-note">ご入力いただいた情報は、資料のご案内とお問い合わせへの対応にのみ使用します。</p>
          </form>
        </div>
      ) : (
        <div>
          <h2 id="gd-t">ありがとうございます</h2>
          <p className="gd-lead">資料を別のタブで開きました。開かない場合は、下のボタンからご覧ください。</p>
          <a className="btn" href={SITE.guide} target="_blank" rel="noopener" onClick={() => ref.current.close()} aria-busy={busy}>資料を開く<Arrow /></a>
        </div>
      )}
    </dialog>
  );
}
