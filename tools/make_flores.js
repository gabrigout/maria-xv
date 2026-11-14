/* Gera as hortênsias provisórias do convite (desenho procedural em <canvas>).
   Uso:  node tools/make_flores.js <pasta-saida>
   Saída: canto.png, arranjo.png, ramo.png (fundo transparente). Depois:
          python3 tools/to_webp.py <pasta-saida> assets/img/flores
   Quando chegarem as ilustrações definitivas, basta salvar com os mesmos nomes. */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2] || 'flores-png';
fs.mkdirSync(OUT, { recursive: true });

function desenhar(qual) {
  /* ---------- utilitários ---------- */
  let seed = { canto: 7, arranjo: 21, ramo: 33 }[qual];
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (c1, c2, t) => c1.map((v, i) => Math.round(lerp(v, c2[i], t)));
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  // paleta: marinho profundo → royal → azul-pó → pérola
  const NAVY = [14, 28, 78], ROYAL = [38, 70, 168], SKY = [146, 172, 224], PEARL = [238, 241, 247];
  const LEAF_D = [52, 74, 104], LEAF_L = [176, 192, 210];

  const tamanhos = { canto: [1400, 1400], arranjo: [1100, 860], ramo: [1600, 420] };
  const [W, H] = tamanhos[qual];
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');

  /* ---------- florzinha de hortênsia (4 pétalas) ---------- */
  function floret(x, y, s, rot, cor, luz) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.shadowColor = 'rgba(2,6,24,.45)'; ctx.shadowBlur = s * .35; ctx.shadowOffsetY = s * .12;
    for (let k = 0; k < 4; k++) {
      ctx.save(); ctx.rotate(k * Math.PI / 2 + (rnd() - .5) * .25);
      const l = s * (0.92 + rnd() * .16), w = s * .62;
      const g = ctx.createLinearGradient(0, 0, 0, -l);
      g.addColorStop(0, rgba(mix(cor, PEARL, .35 * luz + .1), 1));
      g.addColorStop(.55, rgba(cor, 1));
      g.addColorStop(1, rgba(mix(cor, NAVY, .35 - .25 * luz), 1));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.bezierCurveTo(w * .95, -l * .18, w * .78, -l * .98, 0, -l);
      ctx.bezierCurveTo(-w * .78, -l * .98, -w * .95, -l * .18, 0, 0);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      // nervura e contorno finos
      ctx.strokeStyle = rgba(mix(cor, NAVY, .55), .45); ctx.lineWidth = Math.max(.6, s * .028);
      ctx.stroke();
      ctx.strokeStyle = rgba(mix(cor, PEARL, .6), .35 * luz); ctx.lineWidth = Math.max(.5, s * .02);
      ctx.beginPath(); ctx.moveTo(0, -l * .12); ctx.quadraticCurveTo(w * .08, -l * .5, 0, -l * .82); ctx.stroke();
      ctx.restore();
      ctx.shadowColor = 'rgba(2,6,24,.45)';
    }
    ctx.shadowColor = 'transparent';
    // miolo
    ctx.fillStyle = rgba(mix(cor, PEARL, .75), .95);
    ctx.beginPath(); ctx.arc(0, 0, s * .1, 0, 6.283); ctx.fill();
    ctx.fillStyle = rgba(NAVY, .55);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + .78; ctx.beginPath(); ctx.arc(Math.cos(a) * s * .05, Math.sin(a) * s * .05, s * .022, 0, 6.283); ctx.fill(); }
    ctx.restore();
  }

  /* ---------- cacho de hortênsia em domo ---------- */
  function cacho(cx, cy, R, opts = {}) {
    const n = opts.n || Math.round(R * R / 260);
    const base = opts.base || NAVY, meio = opts.meio || ROYAL, alto = opts.alto || SKY;
    const pts = [];
    const ga = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const r = Math.sqrt((i + .5) / n) * R * (0.98 + rnd() * .06);
      const a = i * ga + rnd() * .3;
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * .9;
      const d = r / R;
      const z = Math.sqrt(Math.max(0, 1 - d * d));
      // luz vinda de cima/esquerda
      const nx = (x - cx) / R, ny = (y - cy) / R;
      const luz = Math.max(0, Math.min(1, (.55 * z + .45 * (-nx * .55 - ny * .75) + .12) * (.8 + rnd() * .3)));
      pts.push({ x, y, z, luz, s: R * (.2 + .07 * z) * (0.85 + rnd() * .3) });
    }
    // sombra difusa sob o cacho
    const sg = ctx.createRadialGradient(cx + R * .08, cy + R * .14, R * .2, cx + R * .08, cy + R * .14, R * 1.15);
    sg.addColorStop(0, 'rgba(2,6,22,.5)'); sg.addColorStop(1, 'rgba(2,6,22,0)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx + R * .08, cy + R * .14, R * 1.15, 0, 6.283); ctx.fill();
    pts.sort((p, q) => p.z - q.z);
    pts.forEach((p) => {
      let cor = p.luz < .45 ? mix(base, meio, p.luz / .45) : mix(meio, alto, (p.luz - .45) / .55);
      if (rnd() < (opts.perola || .04)) cor = mix(PEARL, SKY, .25);
      floret(p.x, p.y, p.s, rnd() * 6.283, cor, p.luz);
    });
  }

  /* ---------- ramo de eucalipto prateado ---------- */
  function eucalipto(x0, y0, ang, len, folha, lado = 1) {
    ctx.save(); ctx.translate(x0, y0); ctx.rotate(ang);
    const curva = len * .12 * lado;
    ctx.strokeStyle = rgba(mix(LEAF_D, LEAF_L, .3), .9); ctx.lineWidth = Math.max(1.2, folha * .07);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(len * .5, curva, len, 0); ctx.stroke();
    const qtd = Math.round(len / (folha * 1.35));
    for (let i = 1; i <= qtd; i++) {
      const t = i / (qtd + .4);
      const px = len * t, py = 2 * (1 - t) * t * curva;
      const s = folha * (1.05 - t * .45);
      [-1, 1].forEach((sd, j) => {
        if (i === qtd && j) return;
        ctx.save(); ctx.translate(px + sd * folha * .3, py); ctx.rotate(sd < 0 ? .45 + rnd() * .35 : Math.PI - .45 - rnd() * .35);
        const g = ctx.createLinearGradient(-s, -s, s, s);
        g.addColorStop(0, rgba(LEAF_L, .95)); g.addColorStop(.55, rgba(mix(LEAF_D, LEAF_L, .45), .95)); g.addColorStop(1, rgba(LEAF_D, .95));
        ctx.shadowColor = 'rgba(2,6,24,.4)'; ctx.shadowBlur = s * .3; ctx.shadowOffsetY = s * .1;
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.ellipse(0, -s * .55, s * .5, s * .6, 0, 0, 6.283); ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = 'rgba(235,240,248,.35)'; ctx.lineWidth = Math.max(.6, s * .03);
        ctx.beginPath(); ctx.moveTo(0, -s * .05); ctx.lineTo(0, -s * 1.0); ctx.stroke();
        ctx.restore();
      });
    }
    ctx.restore();
  }

  /* ---------- arabesco prateado ---------- */
  function arabesco(x, y, esc, rot, espelho = 1) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(esc * espelho, esc);
    const g = ctx.createLinearGradient(0, -60, 200, 60);
    g.addColorStop(0, '#f6f8fb'); g.addColorStop(.35, '#9aa6b9'); g.addColorStop(.6, '#eef2f7'); g.addColorStop(1, '#8a96aa');
    ctx.strokeStyle = g; ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 3; ctx.shadowOffsetY = 1.5;
    ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.bezierCurveTo(50, -40, 110, -30, 150, 4);
    ctx.bezierCurveTo(176, 26, 160, 52, 138, 44);
    ctx.bezierCurveTo(120, 37, 128, 18, 142, 22);
    ctx.stroke();
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(70, -26);
    ctx.bezierCurveTo(78, -56, 112, -66, 128, -50);
    ctx.bezierCurveTo(138, -40, 128, -28, 118, -34);
    ctx.stroke();
    ctx.fillStyle = '#e9eef5';
    [[150, 4, 2.6], [128, -50, 2], [0, 0, 2.2]].forEach(([a, b, r]) => { ctx.beginPath(); ctx.arc(a, b, r, 0, 6.283); ctx.fill(); });
    ctx.restore();
  }

  /* ---------- florzinhas soltas ---------- */
  function soltas(qtd, x0, y0, x1, y1, s) {
    for (let i = 0; i < qtd; i++) {
      const cor = [ROYAL, SKY, mix(NAVY, ROYAL, .5), mix(PEARL, SKY, .2)][i % 4];
      floret(lerp(x0, x1, rnd()), lerp(y0, y1, rnd()), s * (.8 + rnd() * .4), rnd() * 6.283, cor, .6);
    }
  }

  /* ---------- laço de cetim prateado (arranjo) ---------- */
  function laco(x, y, s) {
    ctx.save(); ctx.translate(x, y);
    const g = ctx.createLinearGradient(-s, -s * .5, s, s * .5);
    g.addColorStop(0, '#f2f5f9'); g.addColorStop(.3, '#a9b3c4'); g.addColorStop(.5, '#f7f9fc'); g.addColorStop(.75, '#8b97ab'); g.addColorStop(1, '#dfe5ee');
    ctx.fillStyle = g; ctx.shadowColor = 'rgba(2,6,24,.5)'; ctx.shadowBlur = s * .12; ctx.shadowOffsetY = s * .05;
    // pontas
    [[-1, 1], [1, 1]].forEach(([sx]) => {
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.bezierCurveTo(sx * s * .25, s * .4, sx * s * .35, s * .8, sx * s * .5, s * 1.05);
      ctx.lineTo(sx * s * .62, s * .9); ctx.lineTo(sx * s * .7, s * 1.08);
      ctx.bezierCurveTo(sx * s * .5, s * .7, sx * s * .2, s * .35, 0, 0); ctx.fill();
    });
    // alças
    [[-1], [1]].forEach(([sx]) => {
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.bezierCurveTo(sx * s * .3, -s * .55, sx * s * 1.0, -s * .5, sx * s * .9, -s * .05);
      ctx.bezierCurveTo(sx * s * .85, s * .25, sx * s * .35, s * .15, 0, 0); ctx.fill();
      ctx.strokeStyle = 'rgba(90,102,124,.45)'; ctx.lineWidth = s * .015;
      ctx.beginPath(); ctx.moveTo(sx * s * .12, -s * .05); ctx.bezierCurveTo(sx * s * .4, -s * .3, sx * s * .7, -s * .25, sx * s * .78, -s * .05); ctx.stroke();
    });
    ctx.beginPath(); ctx.ellipse(0, 0, s * .14, s * .12, 0, 0, 6.283); ctx.fill();
    ctx.restore();
  }

  /* ---------- composições ---------- */
  if (qual === 'canto') {
    // buquê de canto que "flutua": nada encosta na borda da imagem (pode ser usado solto ou no canto da tela)
    arabesco(640, 200, 1.4, .1); arabesco(200, 640, 1.4, 1.47, -1);
    eucalipto(470, 260, -.04, 760, 64, 1);
    eucalipto(260, 470, 1.6, 760, 64, -1);
    eucalipto(470, 470, .78, 520, 56, 1);
    cacho(360, 360, 230, { perola: .05 });
    cacho(620, 290, 135, {});
    cacho(290, 620, 135, {});
    cacho(560, 540, 105, { alto: [190, 208, 242] });
    soltas(5, 760, 380, 980, 470, 32);
    soltas(4, 380, 760, 470, 980, 32);
  } else if (qual === 'arranjo') {
    eucalipto(560, 520, -2.75, 470, 60, 1);
    eucalipto(560, 520, -.32, 470, 60, -1);
    eucalipto(560, 520, -1.95, 360, 52, -1);
    cacho(430, 400, 200, {});
    cacho(690, 410, 175, { perola: .06 });
    cacho(565, 300, 150, { alto: [190, 208, 242] });
    soltas(3, 330, 560, 790, 640, 30);
  } else {
    // ramo horizontal fino e simétrico
    arabesco(800, 210, 1.2, Math.PI + .08, 1); arabesco(800, 210, 1.2, -.08, -1);
    arabesco(800, 210, 1.2, .08, 1); arabesco(800, 210, 1.2, Math.PI - .08, -1);
    eucalipto(800, 210, Math.PI - .02, 600, 44, 1);
    eucalipto(800, 210, .02, 600, 44, -1);
    cacho(800, 205, 110, {});
    cacho(690, 230, 64, {}); cacho(910, 230, 64, {});
    soltas(3, 600, 170, 640, 260, 22); soltas(3, 960, 170, 1000, 260, 22);
  }
  return cv.toDataURL('image/png');
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const qual of ['canto', 'arranjo', 'ramo']) {
    const url = await page.evaluate(desenhar, qual);
    fs.writeFileSync(path.join(OUT, qual + '.png'), Buffer.from(url.split(',')[1], 'base64'));
    console.log('ok', qual);
  }
  await browser.close();
})();
