// Gera a arte decorativa do convite (rosas, fitas, pérolas, balões, borboleta) como imagens com fundo transparente.
// Uso:  node tools/make_art.js <pasta-de-saída>      (precisa de Playwright; depois converta para WebP com tools/to_webp.py)
// Desenhada em SVG e "assada" em imagem: no celular só carrega um arquivo leve, sem filtros nem animação.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.argv[2] || 'art-png';
fs.mkdirSync(OUT, { recursive: true });

let seed = 5;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const f = (n) => Math.round(n * 100) / 100;

const DEFS = `
<radialGradient id="rg" cx=".36" cy=".3" r=".9"><stop offset="0" stop-color="#2b4aa6"/><stop offset=".4" stop-color="#112a78"/><stop offset=".78" stop-color="#071647"/><stop offset="1" stop-color="#030820"/></radialGradient>
<radialGradient id="rg2" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="#223c8c"/><stop offset=".6" stop-color="#0a1b55"/><stop offset="1" stop-color="#030820"/></radialGradient>
<linearGradient id="lfn" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#34608f"/><stop offset="1" stop-color="#0c1d3c"/></linearGradient>
<linearGradient id="lfs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f8fb"/><stop offset=".5" stop-color="#aab4c6"/><stop offset="1" stop-color="#6c778c"/></linearGradient>
<linearGradient id="ribn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3d63c8"/><stop offset=".45" stop-color="#0c1d5a"/><stop offset="1" stop-color="#4a72d8"/></linearGradient>
<linearGradient id="ribs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8e99ac"/><stop offset=".5" stop-color="#f6f8fb"/><stop offset="1" stop-color="#7f8ba0"/></linearGradient>
<radialGradient id="pearl" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#d4dae6"/><stop offset="1" stop-color="#7f8aa0"/></radialGradient>
<linearGradient id="wing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fa0f0"/><stop offset=".5" stop-color="#2646a2"/><stop offset="1" stop-color="#0a1a52"/></linearGradient>
<filter id="gl" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="sh" x="-30%" y="-30%" width="170%" height="170%"><feDropShadow dx="0" dy="2" stdDeviation="2.4" flood-color="#000" flood-opacity=".55"/></filter>`;

const leaf = (x, y, rot, len, fill) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})" filter="url(#sh)"><path d="M0 0C${f(len * .25)} ${f(-len * .3)} ${f(len * .75)} ${f(-len * .3)} ${len} 0C${f(len * .75)} ${f(len * .3)} ${f(len * .25)} ${f(len * .3)} 0 0Z" fill="${fill}" stroke="#dfe5ee" stroke-width=".9" stroke-opacity=".85"/><path d="M${f(len * .06)} 0H${f(len * .92)}" stroke="#dfe5ee" stroke-width=".7" opacity=".5"/>${[.3, .5, .7].map((t) => `<path d="M${f(len * t)} 0L${f(len * (t + .12))} ${f(-len * .13)}M${f(len * t)} 0L${f(len * (t + .12))} ${f(len * .13)}" stroke="#dfe5ee" stroke-width=".5" opacity=".38" fill="none"/>`).join('')}</g>`;

function rose(cx, cy, R, grad = 'rg') {
  let g = `<g transform="translate(${cx} ${cy}) rotate(${f(rnd() * 360)})" filter="url(#sh)"><circle r="${f(R * .98)}" fill="#050d30" stroke="#dfe5ee" stroke-width="1.1" stroke-opacity=".9"/>`;
  [[7, .52, .5, .44, 0], [6, .4, .4, .36, 26], [5, .28, .3, .28, 12], [4, .16, .2, .19, 40]].forEach(([n, d, rx, ry, off]) => {
    for (let k = 0; k < n; k++) {
      const a = off + k * (360 / n);
      g += `<g transform="rotate(${f(a)})"><ellipse cx="0" cy="${f(-R * d)}" rx="${f(R * rx)}" ry="${f(R * ry)}" fill="url(#${grad})" stroke="#dfe5ee" stroke-width="1" stroke-opacity=".88"/><path d="M${f(-R * rx * .7)} ${f(-R * d - R * ry * .45)}Q0 ${f(-R * d - R * ry * 1.02)} ${f(R * rx * .7)} ${f(-R * d - R * ry * .45)}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1"/></g>`;
    }
  });
  g += `<path d="M0 0C${f(R * .1)} ${f(-R * .1)} ${f(R * .14)} ${f(R * .08)} 0 ${f(R * .12)}C${f(-R * .17)} ${f(R * .08)} ${f(-R * .13)} ${f(-R * .17)} ${f(R * .02)} ${f(-R * .19)}" fill="none" stroke="#dfe5ee" stroke-width="1" opacity=".9"/>`;
  return g + '</g>';
}

const bez = (p, t) => { const u = 1 - t; return [u * u * u * p[0] + 3 * u * u * t * p[2] + 3 * u * t * t * p[4] + t * t * t * p[6], u * u * u * p[1] + 3 * u * u * t * p[3] + 3 * u * t * t * p[5] + t * t * t * p[7]]; };
const pearls = (p, n, r) => { let g = ''; for (let i = 0; i <= n; i++) { const [x, y] = bez(p, i / n); g += `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="url(#pearl)" filter="url(#sh)"/>`; } return g; };
const ribbon = (d, w, grad) => `<path d="${d}" fill="none" stroke="#dfe5ee" stroke-opacity=".55" stroke-width="${w + 2.2}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="url(#${grad})" stroke-width="${w}" stroke-linecap="round" filter="url(#sh)"/><path d="${d}" fill="none" stroke="#fff" stroke-opacity=".36" stroke-width="${f(w * .2)}" stroke-linecap="round" transform="translate(${f(-w * .16)} ${f(-w * .1)})"/>`;
const sparkle = (x, y, s, o = .9) => { const k = s * .16; return `<path filter="url(#gl)" opacity="${o}" fill="#fff" d="M${x} ${y - s}C${x + k} ${y - k} ${x + k} ${y - k} ${x + s} ${y}C${x + k} ${y + k} ${x + k} ${y + k} ${x} ${y + s}C${x - k} ${y + k} ${x - k} ${y + k} ${x - s} ${y}C${x - k} ${y - k} ${x - k} ${y - k} ${x} ${y - s}Z"/>`; };

// ------------------------------------------------------------------ canto: rosas + folhas + fita + pérolas
function corner() {
  let b = '';
  b += ribbon('M-14 214C40 172 14 104 76 70S178 44 256 22', 12, 'ribn') + ribbon('M-14 188C34 150 8 96 66 66S168 36 256 8', 6, 'ribs');
  b += pearls([4, 168, 6, 82, 70, 14, 168, 6], 18, 3.3) + pearls([22, 138, 26, 80, 78, 36, 138, 30], 11, 2.6);
  const M = [92, 94], A = [180, 54], B = [50, 182], C = [148, 156];
  [[-12, 84, 'lfs'], [10, 92, 'lfn'], [34, 86, 'lfs'], [58, 92, 'lfn'], [82, 84, 'lfs'], [104, 90, 'lfn'], [128, 80, 'lfs']].forEach(([a, l, g]) => b += leaf(M[0], M[1], a, l, `url(#${g})`));
  [[-20, 56, 'lfn'], [8, 60, 'lfs'], [-45, 54, 'lfn']].forEach(([a, l, g]) => b += leaf(A[0], A[1], a, l, `url(#${g})`));
  [[70, 56, 'lfn'], [96, 58, 'lfs'], [122, 54, 'lfn']].forEach(([a, l, g]) => b += leaf(B[0], B[1], a, l, `url(#${g})`));
  b += rose(M[0], M[1], 54) + rose(A[0], A[1], 33, 'rg2') + rose(B[0], B[1], 34, 'rg2') + rose(C[0], C[1], 19, 'rg');
  for (let i = 0; i < 14; i++) b += sparkle(f(8 + rnd() * 220), f(8 + rnd() * 220), f(2.5 + rnd() * 5), .5 + rnd() * .45);
  return b;
}

// ------------------------------------------------------------------ balões
function balloons() {
  const bal = (id, x, y, rx, ry, c1, c2) => `<radialGradient id="${id}" cx=".34" cy=".28" r=".85"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient>
   <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#${id})" stroke="#dfe5ee" stroke-width=".8" stroke-opacity=".6" filter="url(#sh)"/>
   <ellipse cx="${f(x - rx * .36)}" cy="${f(y - ry * .42)}" rx="${f(rx * .17)}" ry="${f(ry * .27)}" fill="#fff" opacity=".55" transform="rotate(-24 ${f(x - rx * .36)} ${f(y - ry * .42)})"/>
   <path d="M${x - 4} ${y + ry - 1}L${x + 4} ${y + ry - 1}L${x} ${y + ry + 6}Z" fill="${c2}"/>`;
  const str = (x, y) => `<path d="M${x} ${y}C${x - 6} ${y + 40} ${x + 8} ${y + 80} 66 196" fill="none" stroke="#dfe5ee" stroke-width=".9" opacity=".7"/>`;
  return str(42, 98) + str(88, 86) + str(62, 142) + bal('ba', 42, 56, 34, 42, '#7ea1f2', '#0d1f62') + bal('bb', 88, 44, 30, 38, '#fbfcfe', '#7b8598') + bal('bc', 62, 102, 28, 35, '#4a72d8', '#0a1a52');
}

// ------------------------------------------------------------------ borboleta
function butterfly() {
  const wingR = `<g><path d="M0 0C28 -44 76 -38 66 -2C60 20 22 18 0 0Z" fill="url(#wing)" stroke="#dfe5ee" stroke-width="1.2"/><path d="M0 0C26 12 52 36 34 58C14 60 4 28 0 0Z" fill="url(#wing)" stroke="#dfe5ee" stroke-width="1.2"/>
   <path d="M4 -2C26 -22 50 -26 62 -8M4 0C24 -4 44 -4 60 4M4 4C20 10 30 22 32 40" stroke="#dfe5ee" stroke-width=".7" fill="none" opacity=".7"/>
   <circle cx="44" cy="-12" r="4.6" fill="#e6ebf2" opacity=".8"/><circle cx="26" cy="38" r="3.2" fill="#e6ebf2" opacity=".8"/></g>`;
  return `<g transform="translate(88 72) rotate(-14)" filter="url(#sh)"><g>${wingR}</g><g transform="scale(-1 1)">${wingR}</g>
   <ellipse cx="0" cy="8" rx="3.6" ry="20" fill="url(#lfs)" stroke="#dfe5ee" stroke-width=".8"/><path d="M-1 -10C-8 -26 -16 -30 -20 -28M1 -10C8 -26 16 -30 20 -28" stroke="#dfe5ee" stroke-width="1" fill="none"/></g>`;
}

const ITEMS = [
  ['corner', 240, 240, corner()],
  ['balloons', 120, 200, balloons()],
  ['butterfly', 180, 150, butterfly()],
];

(async () => {
  const browser = await chromium.launch();
  for (const [name, w, h, body] of ITEMS) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    await page.setContent(`<!doctype html><body style="margin:0;background:transparent"><svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${DEFS}</defs>${body}</svg>`);
    await page.screenshot({ path: `${OUT}/${name}.png`, omitBackground: true });
    await page.close();
    console.log(name, 'ok');
  }
  await browser.close();
})();
