import React from 'react';
import SurfaceWipe from '../gimmicks/SurfaceWipe';
import FooterReveal from '../layout/FooterReveal';
import NextPageBand from '../gimmicks/NextPageBand';

/**
 * 009–010 フッター: SurfaceWipe（brand → light）+ FooterReveal（白 61vh）+ NextPageBand（帯 39vh）。
 * 既定で直前の LiquidSection に重ねる（overlap）: CTA が固定されたまま白面が覆う。
 */
export default function FooterSection({ nextLabel, nextPath, sheet, overlap = true }) {
  return (
    <SurfaceWipe
      overlap={overlap}
      brand={<div className="absolute inset-0" aria-hidden="true" />}
      light={(
        <>
          <FooterReveal sheet={sheet - 1} />
          <NextPageBand nextLabel={nextLabel} nextPath={nextPath} sheet={sheet} />
        </>
      )}
    />
  );
}
