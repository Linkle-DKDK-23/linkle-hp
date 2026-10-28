/**
 * CloudFront Function（viewer-request, cloudfront-js-2.0）。ディストリビューション E1P3P8CPSEO8HE の既定ビヘイビアに関連付ける。
 * 1. www.linkle.group → linkle.group へ 301（重複 URL の統合）
 * 2. 末尾スラッシュ付き（/about/）→ スラッシュなし（/about）へ 301（canonical と一致させる）
 * 3. 拡張子のないパス（/about）→ /about/index.html に内部書き換え（scripts/prerender-meta.mjs が書き出したページ別 HTML を返す）
 *    存在しないパスは S3 が 403 を返し、既存のカスタムエラーレスポンスで /index.html（SPA）にフォールバックする。
 */
function handler(event) {
  var request = event.request;
  var host = request.headers.host ? request.headers.host.value : '';
  var uri = request.uri;

  var qs = [];
  for (var key in request.querystring) {
    var q = request.querystring[key];
    if (q.multiValue) {
      for (var i = 0; i < q.multiValue.length; i++) qs.push(key + '=' + q.multiValue[i].value);
    } else {
      qs.push(key + '=' + q.value);
    }
  }
  var search = qs.length ? '?' + qs.join('&') : '';

  if (host.indexOf('www.') === 0) {
    return redirect('https://' + host.substring(4) + uri + search);
  }
  if (uri.length > 1 && uri.charAt(uri.length - 1) === '/') {
    return redirect('https://' + host + uri.replace(/\/+$/, '') + search);
  }
  if (uri !== '/' && uri.split('/').pop().indexOf('.') === -1) {
    request.uri = uri + '/index.html';
  }
  return request;
}

function redirect(location) {
  return {
    statusCode: 301,
    statusDescription: 'Moved Permanently',
    headers: { location: { value: location }, 'cache-control': { value: 'max-age=3600' } },
  };
}
