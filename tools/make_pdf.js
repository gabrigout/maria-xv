// Gera o convite em PDF (uma página, formato de celular) que leva ao site com um toque.
// A página inteira é um link; há também um botão visível e um QR code.
//
// Uso:  node tools/make_pdf.js <qr.svg> <saida.pdf>
//       (o qr.svg sai do segno:  python3 -c "import segno; segno.make('URL', error='m').save('qr.svg', scale=6, border=2, dark='#0b1a4a', light='#eef1f7')")
// Os textos vêm do CONFIG de assets/js/app.js, então mudanças de data/local entram sozinhas.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const URL_SITE = 'https://gilded-naiad-b9886f.netlify.app/';
const [QR, SAIDA] = process.argv.slice(2);
const img = (p) => 'file://' + path.join(RAIZ, 'assets/img', p);

// lê o CONFIG sem executar o resto do app
const fonte = fs.readFileSync(path.join(RAIZ, 'assets/js/app.js'), 'utf8');
const CONFIG = new Function(fonte.slice(fonte.indexOf('const CONFIG'), fonte.indexOf('};', fonte.indexOf('const CONFIG')) + 2) + '; return CONFIG;')();
const DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const [a, m, d] = CONFIG.evento.data.split('-').map(Number);
const semana = DIAS[new Date(Date.UTC(a, m - 1, d)).getUTCDay()];
const [hh, mm] = CONFIG.evento.hora.split(':').map(Number);
const hora = mm ? `${hh}h${String(mm).padStart(2, '0')}` : `${hh}h`;
const P = CONFIG.pessoa, L = CONFIG.local;

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Jost:wght@500&family=Pinyon+Script&display=swap">
<style>
  @page { size: 540px 960px; margin: 0; }
  html, body { margin: 0; width: 540px; height: 960px; overflow: hidden; background: #040a1c; font-variant-numeric: lining-nums; font-feature-settings: "lnum" 1; }
  a.todo { position: absolute; inset: 0; display: block; color: inherit; text-decoration: none; }
  .bg { position: absolute; inset: 0; background: url(${img('texturas/cetim.webp')}) center / cover; filter: brightness(.72); }
  .luz { position: absolute; inset: 0; background: radial-gradient(70% 45% at 50% 46%, rgba(42, 79, 181, .28), transparent 70%), linear-gradient(180deg, rgba(3,7,20,.2), rgba(3,7,20,.55)); }
  .top, .bot { position: absolute; left: 0; width: 540px; }
  .top { top: 0; } .bot { bottom: 0; }
  .vine { position: absolute; top: 200px; bottom: 200px; width: 111px; background-repeat: repeat-y; background-size: 100% auto; }
  .vine.l { left: -36px; background-image: url(${img('flores/vinha-esq.webp')}); }
  .vine.r { right: -35px; background-image: url(${img('flores/vinha-dir.webp')}); }
  .c { position: absolute; left: 70px; right: 70px; top: 196px; bottom: 210px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #f1f4f8; }
  .arco { position: absolute; inset: 0; border-radius: 999px 999px 12px 12px; background: linear-gradient(180deg, rgba(9,22,66,.86), rgba(5,12,38,.9)); box-shadow: 0 30px 60px -30px #000; }
  .arco::before { content: ""; position: absolute; inset: 0; border-radius: inherit; border: 1.5px solid #8fa0c2; }
  .arco::after { content: ""; position: absolute; inset: 7px; border-radius: 999px 999px 7px 7px; border: 1px solid rgba(150,168,205,.35); }
  .in { position: relative; display: flex; flex-direction: column; align-items: center; padding: 40px 24px 26px; }
  .mono { width: 84px; margin-bottom: 2px; }
  .xv { font: 500 54px/1 'Cormorant Garamond', serif; letter-spacing: .1em; text-indent: .1em;
        background: linear-gradient(180deg, #fff, #dfe5ee 40%, #9aa6ba 56%, #e8edf4 76%); -webkit-background-clip: text; color: transparent; }
  .n { font: 400 54px/1.12 'Pinyon Script', cursive; text-shadow: 0 3px 14px rgba(0,0,0,.6); margin-top: 2px; }
  .div { width: 230px; margin: 8px 0 4px; }
  .conv { font: 600 18px/1.3 'Cormorant Garamond', serif; }
  .data { margin-top: 14px; padding: 8px 6px; border-top: 1px solid rgba(197,206,219,.25); border-bottom: 1px solid rgba(197,206,219,.25);
          font: 500 11.5px/1.65 'Jost', sans-serif; letter-spacing: .18em; text-transform: uppercase; color: #dfe5ee; }
  .data b { display: block; font: 600 24px/1.15 'Cormorant Garamond', serif; letter-spacing: .06em; text-transform: none; color: #f1f4f8; }
  .local { margin-top: 10px; font: italic 500 16px/1.35 'Cormorant Garamond', serif; color: #c5cedb; }
  .btn { margin-top: 18px; padding: 13px 22px; border-radius: 999px; border: 1px solid #b4c0d8;
         background: linear-gradient(180deg, #1f3f94, #0c1d52); box-shadow: 0 10px 22px -10px #000, 0 0 22px rgba(60,100,210,.35);
         font: 500 12.5px/1 'Jost', sans-serif; letter-spacing: .22em; text-indent: .22em; text-transform: uppercase; color: #f1f4f8; }
  .rodape { position: absolute; left: 0; right: 0; bottom: 86px; display: flex; align-items: center; justify-content: center; gap: 12px; }
  .qr { width: 74px; height: 74px; border-radius: 8px; overflow: hidden; box-shadow: 0 6px 16px rgba(0,0,0,.5); }
  .qr img { width: 100%; height: 100%; display: block; }
  .dica { font: italic 500 13.5px/1.3 'Cormorant Garamond', serif; color: #dfe5ee; text-align: left; max-width: 150px;
          background: rgba(4,10,28,.72); padding: 6px 10px; border-radius: 8px; }
</style></head><body>
<a class="todo" href="${URL_SITE}">
  <div class="bg"></div><div class="luz"></div>
  <img class="top" src="${img('flores/faixa-cima.webp')}"><img class="bot" src="${img('flores/faixa-baixo.webp')}">
  <div class="c"><div class="arco"></div><div class="in">
    <img class="mono" src="${img('ornamentos/monograma.webp')}">
    <div class="xv">${P.xv}</div>
    <div class="n">${P.nome}</div>
    <img class="div" src="${img('flores/divisor.webp')}">
    <div class="conv">${CONFIG.textos.convite.chamada}</div>
    <div class="data">${semana} · ${d} de ${MESES[m - 1]} de ${a}<b>${hora}</b></div>
    <div class="local">${L.nome} · ${L.cidade}</div>
    <div class="btn">Toque para abrir o convite</div>
  </div></div>
  <div class="rodape"><div class="qr"><img src="file://${path.resolve(QR)}"></div><div class="dica">ou aponte a câmera do celular para o código</div></div>
</a>
</body></html>`;

(async () => {
  const tmp = path.join(path.dirname(path.resolve(SAIDA)), 'convite-pdf.html');
  fs.writeFileSync(tmp, html);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 540, height: 960 } });
  await p.goto('file://' + tmp, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: SAIDA.replace(/\.pdf$/, '-previa.png') });
  await p.pdf({ path: SAIDA, width: '540px', height: '960px', printBackground: true, pageRanges: '1' });
  await b.close();
  console.log('ok', SAIDA);
})();
