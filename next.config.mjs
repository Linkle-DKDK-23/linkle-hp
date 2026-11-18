/** 静的書き出し。about/index.html の形で出力し、CloudFront Function（infra/cloudfront/viewer-request.js）が /about → /about/index.html に書き換える。 */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};
export default nextConfig;
