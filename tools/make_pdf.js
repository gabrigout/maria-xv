// Gera o convite em PDF (uma página, formato de celular): a capa é a própria abertura do site
// (envelope com lacre e moldura de prata). A página inteira é um link para o site; há um QR code.
//
// Uso:  node tools/make_pdf.js <qr.svg> <saida.pdf>
//       qr.svg: python3 -c "import segno; segno.make('URL', error='m').save('qr.svg', scale=6, border=2, dark='#0b1a4a', light='#eef1f7')"
// Precisa do site servido em http://localhost:8765/ (python3 -m http.server 8765 na raiz do projeto).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const URL_SITE = 'https://gilded-naiad-b9886f.netlify.app/';
const [QR, SAIDA] = process.argv.slice(2);

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto('http://localhost:8765/', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(4200);                                   // abertura completa (letras, moldura, brilho no lacre)
  await p.addStyleTag({ content: '#skip,.glint,.burst,.ambient__dust{display:none!important}' });
  const png = await p.screenshot({ type: 'png' });
  const capa = 'data:image/png;base64,' + png.toString('base64');
  const qr = 'data:image/svg+xml;base64,' + fs.readFileSync(QR).toString('base64');
  const html = `<!doctype html><meta charset="utf-8"><style>
    @page{size:540px 960px;margin:0} html,body{margin:0;width:540px;height:960px;overflow:hidden;background:#040a1c}
    a{position:absolute;inset:0;display:block} img.f{width:540px;height:960px;display:block}
    .qr{position:absolute;left:50%;bottom:62px;width:70px;height:70px;margin-left:-35px;border-radius:8px;box-shadow:0 6px 16px rgba(0,0,0,.5)}
    .dica{position:absolute;left:0;right:0;bottom:36px;text-align:center;font:italic 500 13px/1 Georgia,serif;color:#c5cedb}
  </style><a href="${URL_SITE}"><img class="f" src="${capa}"><img class="qr" src="${qr}"><div class="dica">ou aponte a câmera para o código</div></a>`;
  const q = await (await b.newContext({ viewport: { width: 540, height: 960 } })).newPage();
  await q.setContent(html);
  await q.screenshot({ path: SAIDA.replace(/\.pdf$/, '-previa.png') });
  await q.pdf({ path: SAIDA, width: '540px', height: '960px', printBackground: true, pageRanges: '1' });
  await b.close();
  console.log('ok', SAIDA);
})();
