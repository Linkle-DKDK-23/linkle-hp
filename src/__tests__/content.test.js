import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import App from '../App';
import { COMMON_TEXT, PAGE_TEXT, PLACEHOLDER_TEXT, CONTACT_STATE_TEXT } from '../content/siteText';

// WebGL / three は jsdom で動かないのでシーンだけ差し替える（描画文言には無関係）
jest.mock('../components/webgl/SceneCanvas', () => ({ __esModule: true, default: () => null }));
jest.mock('@emailjs/browser', () => ({ __esModule: true, default: { send: jest.fn() } }));

const strip = (s) => s.replace(/\s+/g, '');

async function renderPath(path) {
  window.history.pushState({}, '', path);
  const utils = render(<App />);
  // lazy ページの解決を待つ（article[data-page] が付くまで）
  await waitFor(() => expect(document.querySelector('article[data-page]')).toBeTruthy(), { timeout: 5000 });
  return utils;
}

function expectAllText(list) {
  const body = strip(document.body.textContent || '');
  const missing = list.filter((t) => !body.includes(strip(t)));
  expect(missing).toEqual([]);
}

describe('サイト文言の文字列一致（描画 DOM ベース）', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  Object.entries(PAGE_TEXT).forEach(([path, texts]) => {
    it(`${path} に文言がすべて描画される`, async () => {
      await renderPath(path);
      expectAllText([...COMMON_TEXT, ...texts]);
      const placeholders = PLACEHOLDER_TEXT[path] || [];
      placeholders.forEach((p) => expect(document.querySelector(`[placeholder="${p}"]`)).toBeTruthy());
    });
  });

  it('MENU に 6 項目（ニュース を含む）がある', async () => {
    await renderPath('/');
    const menu = document.getElementById('bp-menu');
    expect(menu).toBeTruthy();
    ['ホーム', '会社概要', 'サービス', 'ニュース', '採用情報', 'お問い合わせ'].forEach((label) => {
      expect(strip(menu.textContent)).toContain(label);
    });
  });

  it('未定義パスは / へ戻る', async () => {
    window.history.pushState({}, '', '/news/does-not-exist');
    render(<App />);
    await waitFor(() => expect(document.querySelector('article[data-page="home"]')).toBeTruthy(), { timeout: 5000 });
  });
});

describe('Contact フォームの状態文言', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('バリデーションエラー文言が出る', async () => {
    await renderPath('/contact');
    const form = document.querySelector('form[novalidate]');
    await act(async () => {
      fireEvent.submit(form);
    });
    await waitFor(() => expect(screen.getAllByRole('alert').length).toBeGreaterThanOrEqual(4));
    const body = strip(document.body.textContent);
    CONTACT_STATE_TEXT.validation.filter((t) => !t.startsWith('正しい')).forEach((t) => expect(body).toContain(strip(t)));
  });

  it('送信成功で成功文言、失敗で失敗文言が出る', async () => {
    const emailjs = require('@emailjs/browser').default;
    await renderPath('/contact');
    const fill = () => {
      fireEvent.change(document.getElementById('contact-type'), { target: { value: 'service' } });
      fireEvent.change(document.getElementById('contact-name'), { target: { value: '山田 太郎' } });
      fireEvent.change(document.getElementById('contact-email'), { target: { value: 'a@b.co' } });
      fireEvent.change(document.getElementById('contact-message'), { target: { value: 'test' } });
    };
    emailjs.send.mockRejectedValueOnce(new Error('x'));
    fill();
    await act(async () => { fireEvent.submit(document.querySelector('form[novalidate]')); });
    await waitFor(() => expect(strip(document.body.textContent)).toContain(strip(CONTACT_STATE_TEXT.error[0])));

    emailjs.send.mockResolvedValueOnce({});
    fill();
    await act(async () => { fireEvent.submit(document.querySelector('form[novalidate]')); });
    await waitFor(() => expect(strip(document.body.textContent)).toContain('送信完了'));
    CONTACT_STATE_TEXT.success.forEach((t) => expect(strip(document.body.textContent)).toContain(strip(t)));
  });
});
