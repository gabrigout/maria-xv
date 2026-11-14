/* ============================================================================
   CONVITE XV ANOS — MARIA FERNANDA
   JavaScript puro, sem bibliotecas.

   COMO EDITAR: tudo que muda de convite para convite está no objeto CONFIG
   logo abaixo (data, local, telefone, textos). O resto do arquivo é a
   "mecânica" e normalmente não precisa ser mexido.
   ============================================================================ */

/* ╔═══════════════════════════════════════════════════════════════════════════╗
   ║  CONFIGURAÇÃO — edite aqui                                                ║
   ╚═══════════════════════════════════════════════════════════════════════════╝ */
const CONFIG = {

  /* ----- Aniversariante ----- */
  pessoa: {
    nome: "Maria Fernanda",
    primeiroNome: "Maria",        // aparece em duas linhas na tela de detalhes
    sobrenome: "Fernanda",
    xv: "XV",                     // medalhão, lacre e cartão
    titulo: "XV Anos",
  },

  /* ----- Evento ----- */
  evento: {
    data: "2026-12-17",           // AAAA-MM-DD  (quinta-feira, 17 de dezembro de 2026)
    hora: "21:00",                // HH:MM, formato 24h
    fusoHorario: "-03:00",        // Belém/PA = UTC-3 (sem horário de verão)
    duracaoHoras: 5,              // só para o arquivo de agenda (.ics) e o Google Agenda
    traje: "Esporte fino",
    tituloAgenda: "XV Anos de Maria Fernanda",
    descricaoAgenda: "Convite para os XV anos de Maria Fernanda.\nTraje: esporte fino.\nSua presença será o maior presente.",
  },

  /* ----- Local (o endereço completo é montado a partir destes campos) ----- */
  local: {
    nome: "Le Lys Maison",
    rua: "Travessa São Francisco, 60",
    bairro: "Campina",
    cidade: "Belém/PA",
  },

  /* ----- WhatsApp que recebe confirmações, músicas e recados -----
     DDD + número, só dígitos. Ex.: "91988887777" (o 55 do Brasil é colocado
     sozinho). Se ficar vazio, o WhatsApp abre pedindo para escolher o contato. */
  whatsapp: "91985204553",

  /* ----- Música de fundo: arquivo assets/musica.mp3 (troque o arquivo) ----- */
  musica: {
    volume: 0.7,                  // 0 a 1 (o iPhone ignora e usa o volume do aparelho)
  },

  /* ----- Presentes -----
     grupos: cada grupo tem titulo, nota (opcional) e itens.
             "linha: true" mostra os itens em uma linha só, separados por " · " (bom para marcas/lojas).
     Também dá para usar o link de uma lista online (linkUrl) ou uma lista simples (itens). */
  presentes: {
    aviso: "Lembrando que são apenas sugestões, e sua presença é o maior presente",
    grupos: [
      { titulo: "Roupas", itens: ["Blusa tamanho P", "Body tamanho M", "Short saia tamanho M/38", "Roupa de academia"] },
      { titulo: "Calçados", nota: "36/37", itens: ["Tênis tamanho 37", "Sandália tamanho 36"] },
      { titulo: "Acessórios", nota: "prata ou dourado", itens: ["Anéis", "Brincos", "Colares", "Pulseiras/braceletes", "Bolsas"] },
      { titulo: "Perfumes e corpo", itens: ["Perfumes / body splash (adoro perfume doce)", "Hidratante corporal"] },
      { titulo: "Sugestões de maquiagem", nota: "marcas", linha: true,
        itens: ["Oceane", "Rare Beauty", "Mari Maria", "Boca Rosa", "Franciny Ehlke", "Bruna Tavares", "Huda Beauty", "Too Faced", "O Boticário", "Essence", "Dior", "Nars"] },
      { titulo: "Sugestões de loja", linha: true,
        itens: ["Sephora", "O Boticário", "We Pink", "Bel Cosméticos", "Renner", "C&A", "Zara", "Santa Lolla", "Sapatinho de Luxo", "Arezzo"] },
    ],
    itens: [],                    // lista simples (opcional), além dos grupos
    linkUrl: "",                  // link de lista online (opcional)
    linkTexto: "Ver lista de presentes",
    textoVazio: "[PLACEHOLDER] Coloque aqui a lista de presentes ou o link da lista, em CONFIG.presentes.",
  },

  /* ----- Confirmação de presença ----- */
  rsvp: {
    maxPessoas: 1,                // 1 = convite individual (esconde o seletor de quantidade). Use 2, 3… para permitir acompanhantes.
    prazo: "2026-12-10",          // AAAA-MM-DD: aparece como "até 10 de dezembro". Deixe "" para não mostrar.
  },

  /* ----- Contagem regressiva (uma linha discreta sob a data) -----
     {n} vira o número de dias. mostrar: false desliga.                         */
  contagem: {
    mostrar: true,
    varios: "faltam {n} dias",
    um: "falta 1 dia",
    hoje: "é hoje!",
    depois: "Obrigada por celebrar conosco.",
  },

  /* ----- Mensagens que abrem no WhatsApp -----
     {chaves} são trocadas pelo que o convidado digitou. Linhas cujo campo
     ficou vazio são removidas automaticamente.                                */
  mensagens: {
    rsvp:   "Olá! Confirmo minha presença no XV anos da Maria Fernanda\n\nNome: {nome}\nQuantidade de pessoas: {pessoas}",
    musica: "Olá! Sugestão de música para o XV anos da Maria Fernanda:\n\nMúsica: {musica}\nArtista: {artista}\nDe: {de}",
    recado: "Olá! Deixo um recado para a Maria Fernanda:\n\n{recado}\n\n{de}",
  },

  /* ----- Manual do Convidado (um item por linha) -----
     Cada item: { texto, icone, cores? }. icone: hanger, clock, usercheck, letter, bowtie.
     "cores" mostra amostras (riscadas) das cores que os convidados não devem usar.        */
  manual: [
    { texto: "Não utilize vestidos azuis", icone: "hanger", cores: ["#1f3f91"] },
    { texto: "Seja pontual e aproveite a festa conosco", icone: "clock" },
    { texto: "Confirme sua presença, por favor", icone: "usercheck" },
    { texto: "Convite individual e intransferível, ou seja, convidado não convida", icone: "letter" },
    { texto: "Traje: passeio completo / esporte fino", icone: "bowtie" },
  ],

  /* ----- Textos da interface ----- */
  textos: {
    abrir: "Toque para abrir",
    pular: "Pular",
    capaConvite: "Você está convidado",
    detalhesTitulo: "Detalhes da Celebração",
    convite: {
      chamada: "Convida você para celebrar meus 15 anos",
      frase: "Uma noite especial para viver ao meu lado",
    },
    rotuloData: "Data",
    rotuloHora: "Horário",
    rotuloLocal: "Local",
    rotuloTraje: "Traje",
    rolar: "Role",
    menuTitulo: "Estamos esperando por você",

    menu: {
      rsvp:      { titulo: "Confirmar presença",   sub: "Responda até {prazo}" },
      mapa:      { titulo: "Como chegar",          sub: "Abrir no Google Maps" },
      agenda:    { titulo: "Adicionar à agenda",   sub: "Salvar a data com lembrete" },
      presentes: { titulo: "Sugestão de presentes", sub: "Ver sugestões" },
      musica:    { titulo: "Sugerir uma música",   sub: "Para a pista de dança" },
      recado:    { titulo: "Enviar um recado",     sub: "Uma mensagem para a Maria Fernanda" },
      waze:      { titulo: "Abrir no Waze" },
      copiar:    { titulo: "Copiar endereço" },
    },

    manualTitulo: "Manual do Convidado",
    rodape: "Sua presença será o maior presente.",

    /* formulários */
    enviarWhats: "Enviar pelo WhatsApp",
    naoAbriu: "Se o WhatsApp não abriu,",
    toqueAqui: "toque aqui.",
    seuNome: "Seu nome",
    opcional: "(opcional)",

    rsvp: {
      titulo: "Confirmar presença",
      intro: "Confirme sua presença até {prazo}.",
      nomeLabel: "Seu nome",
      qtdLabel: "Quantidade de pessoas",
      qtdDica: "Conte com você. O convite é individual, então só inclua quem foi convidado junto.",
    },
    agenda: {
      titulo: "Adicionar à agenda",
      intro: "Salve a data no seu calendário para não esquecer.",
      icsTitulo: "Baixar arquivo (.ics)",
      icsSub: "iPhone, Samsung, Outlook e outros",
      gcalTitulo: "Google Agenda",
      gcalSub: "Abrir e salvar no Google",
      dica: "O arquivo já inclui um lembrete 1 dia antes. Se o download não abrir, use o Google Agenda.",
    },
    musica: {
      titulo: "Sugerir uma música",
      intro: "Qual música não pode ficar de fora?",
      musicaLabel: "Nome da música",
      artistaLabel: "Artista",
    },
    recado: {
      titulo: "Enviar um recado",
      intro: "Escreva uma mensagem carinhosa para a Maria Fernanda.",
      label: "Seu recado",
    },

    erros: {
      nome: "Por favor, digite seu nome.",
      musica: "Digite o nome da música.",
      artista: "Digite o nome do artista.",
      recado: "Escreva seu recado.",
    },
    avisos: {
      abrindoWhats: "Abrindo o WhatsApp…",
      agendaBaixada: "Arquivo de agenda gerado.",
      enderecoCopiado: "Endereço copiado.",
      copiarFalhou: "Não consegui copiar. Segure o endereço para copiar.",
    },
    musicaSilenciar: "Silenciar música",
    musicaLigar: "Ativar música",
  },
};


/* ╔═══════════════════════════════════════════════════════════════════════════╗
   ║  A PARTIR DAQUI É A MECÂNICA DO CONVITE (normalmente não precisa editar)  ║
   ╚═══════════════════════════════════════════════════════════════════════════╝ */
(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     Utilitários
     ------------------------------------------------------------------------ */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Lê "textos.menu.rsvp.titulo" dentro de CONFIG. */
  const getPath = (path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), CONFIG);

  /** Troca {chaves} no texto; remove linhas cujo valor ficou vazio. */
  function fill(template, vars) {
    const out = String(template).split('\n').filter((line) => {
      const keys = line.match(/\{(\w+)\}/g) || [];
      return keys.every((k) => String(vars[k.slice(1, -1)] ?? '').trim() !== '');
    }).map((line) => line.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? '').trim()));
    return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();

  const romano = (n) => ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][n - 1] || String(n);

  /** localStorage pode falhar (modo privado): nunca deixar isso quebrar o convite. */
  const Store = {
    get(k) { try { return localStorage.getItem('xv:' + k) || ''; } catch (e) { return ''; } },
    set(k, v) { try { localStorage.setItem('xv:' + k, v); } catch (e) { /* ignora */ } },
  };

  /** Abre um link em nova aba/app (a partir de um toque do usuário). */
  function openExternal(url) {
    const a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /* Faz o :active (feedback ao tocar) funcionar também no Safari do iPhone */
  document.addEventListener('touchstart', function () {}, { passive: true });


  /* ------------------------------------------------------------------------
     Data, hora e endereço (derivados do CONFIG)
     ------------------------------------------------------------------------ */
  const DIAS  = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  const Evento = (function () {
    const ev = CONFIG.evento;
    const [ano, mes, dia] = ev.data.split('-').map(Number);
    const [hh, mm] = ev.hora.split(':').map(Number);

    // dia da semana calculado em UTC (independe do fuso do aparelho)
    const semana = new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay();

    // instante exato do início: data/hora local do evento menos o fuso → UTC
    const m = /^([+-])(\d{2}):?(\d{2})$/.exec(ev.fusoHorario) || ['', '-', '03', '00'];
    const offsetMin = (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3]));
    const inicio = new Date(Date.UTC(ano, mes - 1, dia, hh, mm) - offsetMin * 60000);
    const fim = new Date(inicio.getTime() + ev.duracaoHoras * 3600000);

    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    const L = CONFIG.local;
    return {
      inicio, fim,
      diaSemana: cap(DIAS[semana]),
      dia, mesNome: MESES[mes - 1], ano,
      /** Dias que faltam para a festa, contando a data de hoje no fuso do evento (negativo = já passou). */
      diasAte() {
        const hoje = new Date(Date.now() + offsetMin * 60000);
        const hojeUTC = Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate());
        return Math.round((Date.UTC(ano, mes - 1, dia) - hojeUTC) / 86400000);
      },
      dataLonga: dia + ' de ' + MESES[mes - 1] + ' de ' + ano,
      hora: mm === 0 ? hh + 'h' : hh + 'h' + String(mm).padStart(2, '0'),
      enderecoCompleto: [L.nome, L.rua, L.bairro, L.cidade].filter(Boolean).join(', '),
    };
  })();


  /* ------------------------------------------------------------------------
     Textos: preenche tudo que tem data-cfg="caminho.no.CONFIG"
     ------------------------------------------------------------------------ */
  /** "2026-12-10" → "10 de dezembro" (prazo para confirmar presença) */
  const prazoTexto = (function () {
    const p = CONFIG.rsvp.prazo;
    if (!p) return '';
    const [, m, d] = p.split('-').map(Number);
    return d + ' de ' + MESES[m - 1];
  })();

  function renderTextos() {
    $$('[data-cfg]').forEach((el) => {
      let v = getPath(el.dataset.cfg);
      if (v == null) { console.warn('[convite] texto ausente no CONFIG:', el.dataset.cfg); return; }
      if (typeof v === 'string' && v.indexOf('{prazo}') !== -1) {
        // sem prazo configurado, o trecho "até {prazo}" simplesmente some
        v = prazoTexto ? v.replace('{prazo}', prazoTexto) : v.replace(/\s*até\s*\{prazo\}/, '');
      }
      el.textContent = v;
    });
    document.title = CONFIG.pessoa.titulo + ' · ' + CONFIG.pessoa.nome;
    const nameEl = $('.name');
    if (nameEl) nameEl.setAttribute('aria-label', CONFIG.pessoa.nome);
  }

  function renderEvento() {
    const L = CONFIG.local;
    $('#f-weekday').textContent = Evento.diaSemana;
    montarData($('#f-date'));
    $('#f-time').textContent    = Evento.hora;
    $('#f-place').textContent   = L.nome;
    $('#f-street').textContent  = L.rua;
    $('#f-city').textContent    = [L.bairro, L.cidade].filter(Boolean).join(' · ');
    $('#f-dress').textContent   = CONFIG.evento.traje;

    // Como chegar: busca no Google Maps pelo endereço
    $('#btn-maps').href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(Evento.enderecoCompleto);
    // Waze: abre o aplicativo (ou o site) já com a rota para o endereço
    $('#btn-waze').href = 'https://waze.com/ul?q=' + encodeURIComponent(Evento.enderecoCompleto) + '&navigate=yes';
  }

  /** Data em destaque moderado: dia grande, mês e ano ao lado. O texto completo fica para leitores de tela. */
  function montarData(el) {
    const completo = document.createElement('span');
    completo.className = 'sr-only'; completo.textContent = Evento.dataLonga;
    const dia = document.createElement('span');
    dia.className = 'date__day'; dia.textContent = String(Evento.dia); dia.setAttribute('aria-hidden', 'true');
    const mes = document.createElement('b'); mes.textContent = Evento.mesNome;
    const ano = document.createElement('i'); ano.textContent = String(Evento.ano);
    const resto = document.createElement('span');
    resto.className = 'date__my'; resto.setAttribute('aria-hidden', 'true'); resto.append(mes, ano);
    el.append(completo, dia, resto);
  }

  /** Contagem regressiva: uma linha pequena sob a data. */
  function renderContagem() {
    const C = CONFIG.contagem;
    if (!C || !C.mostrar) return;
    const n = Evento.diasAte();
    const texto = n > 1 ? C.varios.replace('{n}', n) : n === 1 ? C.um : n === 0 ? C.hoje : C.depois;
    if (!texto) return;
    const el = $('#f-count');
    el.textContent = texto;
    el.hidden = false;
  }

  function renderManual() {
    const ol = $('#manual-lista');
    CONFIG.manual.forEach((item, i) => {
      const texto = typeof item === 'string' ? item : item.texto;
      const cores = typeof item === 'string' ? null : item.cores;
      const icone = typeof item === 'string' ? null : item.icone;
      const li = document.createElement('li');
      let n;
      if (icone) {                                     // ícone de linha no lugar do número
        const NS = 'http://www.w3.org/2000/svg';
        n = document.createElementNS(NS, 'svg');
        n.setAttribute('class', 'manual__ico'); n.setAttribute('aria-hidden', 'true');
        const u = document.createElementNS(NS, 'use'); u.setAttribute('href', '#i-' + icone);
        n.appendChild(u);
      } else {
        n = document.createElement('span');
        n.className = 'manual__n'; n.textContent = romano(i + 1); n.setAttribute('aria-hidden', 'true');
      }
      const t = document.createElement('span');
      t.className = 'manual__t'; t.textContent = texto;
      if (cores && cores.length) {                     // amostras (riscadas) das cores a evitar
        const caixa = document.createElement('span');
        caixa.className = 'swatches'; caixa.setAttribute('aria-hidden', 'true');
        cores.forEach((c) => { const s = document.createElement('span'); s.className = 'swatch'; s.style.backgroundColor = c; caixa.appendChild(s); });
        t.appendChild(caixa);
      }
      li.append(n, t);
      ol.appendChild(li);
    });
  }

  function renderPresentes() {
    const box = $('#presentes-corpo');
    const P = CONFIG.presentes;
    const grupos = P.grupos || [];
    const temItens = P.itens && P.itens.length;

    grupos.forEach((g) => {
      const sec = document.createElement('section');
      sec.className = 'gift-group';
      const h = document.createElement('h3');
      h.textContent = g.titulo;
      if (g.nota) { const n = document.createElement('small'); n.textContent = g.nota; h.appendChild(n); }
      sec.appendChild(h);
      if (g.linha) {                                   // marcas/lojas: uma linha corrida
        const p = document.createElement('p');
        p.className = 'gift-line';
        // espaço "preso" dentro de cada nome: "Bel Cosméticos" nunca quebra no meio
        p.textContent = g.itens.map((it) => it.replace(/ /g, ' ')).join(' · ');
        sec.appendChild(p);
      } else {
        const ul = document.createElement('ul');
        ul.className = 'gifts';
        g.itens.forEach((it) => { const li = document.createElement('li'); li.textContent = it; ul.appendChild(li); });
        sec.appendChild(ul);
      }
      box.appendChild(sec);
    });

    if (temItens) {
      const ul = document.createElement('ul');
      ul.className = 'gifts';
      P.itens.forEach((it) => { const li = document.createElement('li'); li.textContent = it; ul.appendChild(li); });
      box.appendChild(ul);
    }
    if (P.linkUrl) {
      const a = document.createElement('a');
      a.className = 'btn btn--primary btn--submit';
      a.href = P.linkUrl; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.textContent = P.linkTexto || 'Abrir';
      box.appendChild(a);
    }
    if (!grupos.length && !temItens && !P.linkUrl) {
      const d = document.createElement('div');
      d.className = 'placeholder-box'; d.textContent = P.textoVazio;
      box.appendChild(d);
    }
  }


  /* ------------------------------------------------------------------------
     WhatsApp (wa.me)
     ------------------------------------------------------------------------ */
  function waUrl(texto) {
    let n = String(CONFIG.whatsapp || '').replace(/\D/g, '');
    if (!n) {
      console.warn('[convite] CONFIG.whatsapp está vazio: o WhatsApp vai pedir para escolher o contato.');
    } else if (n.length <= 11) {
      n = '55' + n;                       // só DDD + número: acrescenta o código do Brasil
    }
    return 'https://wa.me/' + n + '?text=' + encodeURIComponent(texto);
  }

  /** Abre o WhatsApp e mostra o link de reserva no formulário. */
  function enviarWhats(texto, form) {
    if (form.dataset.enviando) return;                  // toque duplo: não abre duas abas
    form.dataset.enviando = '1';
    setTimeout(() => { delete form.dataset.enviando; }, 1800);
    const url = waUrl(texto);
    openExternal(url);
    toast(CONFIG.textos.avisos.abrindoWhats);
    const depois = $('.form__after', form);
    if (depois) { depois.hidden = false; $('a', depois).href = url; }
  }


  /* ------------------------------------------------------------------------
     Agenda: arquivo .ics (com lembrete 1 dia antes) e link do Google Agenda
     ------------------------------------------------------------------------ */
  const fmtUTC = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');   // 20261218T000000Z
  const icsEsc = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

  /** Quebra linhas com mais de 75 bytes (regra do formato iCalendar), sem cortar letras acentuadas. */
  function icsFold(line) {
    const enc = new TextEncoder();
    const partes = [];
    let atual = '', bytes = 0, limite = 75;
    for (const ch of line) {
      const b = enc.encode(ch).length;
      if (bytes + b > limite) { partes.push(atual); atual = ' '; bytes = 1; limite = 75; }
      atual += ch; bytes += b;
    }
    partes.push(atual);
    return partes.join('\r\n');
  }

  function buildICS() {
    const E = CONFIG.evento;
    const linhas = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Convite XV//PT-BR//',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:xv-' + E.data + '-' + fmtUTC(Evento.inicio) + '@convite',
      'DTSTAMP:' + fmtUTC(new Date()),
      'DTSTART:' + fmtUTC(Evento.inicio),     // em UTC: aparece certo em qualquer fuso
      'DTEND:' + fmtUTC(Evento.fim),
      'SUMMARY:' + icsEsc(E.tituloAgenda),
      'LOCATION:' + icsEsc(Evento.enderecoCompleto),
      'DESCRIPTION:' + icsEsc(E.descricaoAgenda),
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-P1D',                         // lembrete 1 dia antes
      'ACTION:DISPLAY',
      'DESCRIPTION:' + icsEsc('Amanhã: ' + E.tituloAgenda),
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ];
    return linhas.map(icsFold).join('\r\n') + '\r\n';
  }

  function baixarICS() {
    const blob = new Blob([buildICS()], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'convite-xv-' + CONFIG.pessoa.primeiroNome.toLowerCase() + '.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast(CONFIG.textos.avisos.agendaBaixada);
  }

  function gcalUrl() {
    const E = CONFIG.evento;
    const q = new URLSearchParams({
      action: 'TEMPLATE',
      text: E.tituloAgenda,
      dates: fmtUTC(Evento.inicio) + '/' + fmtUTC(Evento.fim),
      details: E.descricaoAgenda,
      location: Evento.enderecoCompleto,
    });
    return 'https://calendar.google.com/calendar/render?' + q.toString();
  }


  /* ------------------------------------------------------------------------
     Copiar endereço
     ------------------------------------------------------------------------ */
  function copiarTexto(texto) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(texto);
    return new Promise((ok, falha) => {                // plano B para navegadores antigos
      const ta = document.createElement('textarea');
      ta.value = texto; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      let copiou = false;
      try { copiou = document.execCommand('copy'); } catch (e) { copiou = false; }
      ta.remove();
      copiou ? ok() : falha(new Error('copy'));
    });
  }

  function iniciarEndereco() {
    $('#btn-copiar').addEventListener('click', () => {
      copiarTexto(Evento.enderecoCompleto).then(
        () => toast(CONFIG.textos.avisos.enderecoCopiado),
        () => toast(CONFIG.textos.avisos.copiarFalhou)
      );
    });
  }


  /* ------------------------------------------------------------------------
     Aviso rápido (toast)
     ------------------------------------------------------------------------ */
  let toastTimer = 0;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), 3200);
  }


  /* ------------------------------------------------------------------------
     Música de fundo (só pode começar depois de um toque do usuário)
     ------------------------------------------------------------------------ */
  const Music = (function () {
    const audio = $('#bgm');
    const btn = $('#sound');
    let started = false;

    function ui() {
      const silencioso = audio.paused || audio.muted;
      btn.classList.toggle('is-muted', silencioso);
      btn.setAttribute('aria-label', silencioso ? CONFIG.textos.musicaLigar : CONFIG.textos.musicaSilenciar);
    }

    /** Sobe o volume aos poucos. O volume é sempre mantido entre 0 e 1 (fora disso o navegador dá erro
        e o fade pararia no meio, deixando a música muda). O iPhone ignora o volume: tudo bem. */
    function fadeTo(alvo, ms) {
      const limite = (v) => Math.min(1, Math.max(0, v));
      const t0 = performance.now();
      let v0 = 0;
      try { v0 = limite(audio.volume); } catch (e) { return; }
      function passo(agora) {
        const k = limite((agora - t0) / ms);            // o relógio do frame pode vir um pouco antes de t0
        try { audio.volume = limite(v0 + (alvo - v0) * k); } catch (e) { return; }
        if (k < 1) requestAnimationFrame(passo);
      }
      requestAnimationFrame(passo);
    }

    function tocar() {
      const p = audio.play();
      if (p && typeof p.catch === 'function') p.catch((err) => { console.warn('[convite] música não tocou:', err && err.message); ui(); });
    }

    /** Chamado dentro do toque no lacre (exigência dos navegadores). */
    function start() {
      if (started) return;
      started = true;
      audio.muted = false;
      try { audio.volume = 0; } catch (e) { /* ignora */ }
      tocar();
      fadeTo(Math.min(1, Math.max(0, CONFIG.musica.volume)), 2500);
    }

    function toggle() {
      if (audio.paused) {            // por exemplo: o navegador pausou ao voltar do WhatsApp
        audio.muted = false;
        try { audio.volume = CONFIG.musica.volume; } catch (e) { /* ignora */ }
        tocar();
        started = true;
      } else {
        audio.muted = !audio.muted;
      }
      ui();
    }

    audio.addEventListener('play', ui);
    audio.addEventListener('pause', ui);
    audio.addEventListener('volumechange', ui);
    audio.addEventListener('error', () => {
      console.warn('[convite] não encontrei assets/musica.mp3 — coloque o arquivo da música nessa pasta.');
      btn.hidden = true;
    });
    btn.addEventListener('click', toggle);

    // Pausa ao sair da página (ex.: abrir o WhatsApp) e volta ao retornar
    document.addEventListener('visibilitychange', () => {
      if (!started) return;
      if (document.hidden) audio.pause(); else tocar();
    });

    ui();
    return { start };
  })();


  /* ------------------------------------------------------------------------
     Revelar ao rolar (IntersectionObserver)
     ------------------------------------------------------------------------ */
  const Reveal = {
    iniciar() {
      const els = $$('.reveal');
      const mostrar = (el) => el.classList.remove('reveal', 'is-in');
      if (reduceMotion || !('IntersectionObserver' in window)) { els.forEach(mostrar); return; }

      const io = new IntersectionObserver((entradas) => {
        entradas.filter((e) => e.isIntersecting).forEach((e, i) => {
          const el = e.target;
          el.style.setProperty('--d', (i * 0.09) + 's');       // entrada em sequência
          el.classList.add('is-in');
          io.unobserve(el);
          // depois da animação, tira as classes para não atrapalhar o feedback do toque
          setTimeout(() => { mostrar(el); el.style.removeProperty('--d'); }, 1400 + i * 90);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

      els.forEach((el) => io.observe(el));
    },
  };



  /* ------------------------------------------------------------------------
     Ambiente: partículas prateadas lentas (e algumas florzinhas na abertura)
     Um único <canvas>, ~30 quadros por segundo, pausa quando a aba some.
     ------------------------------------------------------------------------ */
  const Ambiente = (function () {
    const cv = $('#dust');
    const ctx = cv && cv.getContext && cv.getContext('2d');
    if (!ctx) return { abrir() {} };
    const fraco = (navigator.hardwareConcurrency || 4) <= 4 || (navigator.deviceMemory || 4) <= 2;
    const dpr = Math.min(window.devicePixelRatio || 1, fraco ? 1.5 : 2);
    let W = 0, H = 0, poeira = [], flores = [], rodando = false, ultimo = 0, aberto = false;

    function medir() {
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function novaPoeira(qualquerAltura) {
      return {
        x: Math.random() * W, y: qualquerAltura ? Math.random() * H : H + 10,
        r: .5 + Math.random() * 1.3, vy: -(.06 + Math.random() * .16), fase: Math.random() * 6.283,
        amp: .15 + Math.random() * .3, pisca: .25 + Math.random() * .5, vel: .004 + Math.random() * .008,
      };
    }
    function novaFlor(qualquerAltura) {
      const cores = ['#2a4fb5', '#4c74d8', '#a9c1ee', '#e9eef7'];
      return {
        x: Math.random() * W, y: qualquerAltura ? Math.random() * H * .7 : -20,
        s: 6 + Math.random() * 4.5, vy: .22 + Math.random() * .2, rot: Math.random() * 6.283, vr: (Math.random() - .5) * .012,
        fase: Math.random() * 6.283, c: cores[Math.floor(Math.random() * cores.length)], i: Math.floor(Math.random() * 6), a: 0,
      };
    }
    // tira com 6 florzinhas ilustradas (96 px cada); se não carregar, desenha uma versão simples
    const tira = new Image();
    let tiraOk = false;
    tira.onload = () => { tiraOk = true; if (reduceMotion) desenhar(0); };
    tira.src = 'assets/img/flores/florzinhas.webp';
    function florzinha(f) {
      if (tiraOk) {
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.rot);
        ctx.globalAlpha = f.a * .92;
        ctx.drawImage(tira, f.i * 96, 0, 96, 96, -f.s * 1.3, -f.s * 1.3, f.s * 2.6, f.s * 2.6);
        ctx.restore();
        return;
      }
      ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.rot);
      ctx.globalAlpha = f.a * .85; ctx.fillStyle = f.c;
      for (let k = 0; k < 4; k++) {
        ctx.rotate(Math.PI / 2);
        ctx.beginPath(); ctx.moveTo(0, 0);
        ctx.bezierCurveTo(f.s * .6, -f.s * .15, f.s * .5, -f.s, 0, -f.s);
        ctx.bezierCurveTo(-f.s * .5, -f.s, -f.s * .6, -f.s * .15, 0, 0);
        ctx.fill();
      }
      ctx.globalAlpha = f.a; ctx.fillStyle = '#f1f4f8';
      ctx.beginPath(); ctx.arc(0, 0, f.s * .14, 0, 6.283); ctx.fill();
      ctx.restore();
    }
    function desenhar(t) {
      ctx.clearRect(0, 0, W, H);
      poeira.forEach((p) => {
        const a = .3 + p.pisca * (.5 + .5 * Math.sin(p.fase + t / 1000 * p.vel * 60));   // cintila devagar (9–26 s)
        ctx.globalAlpha = a;
        ctx.fillStyle = '#e6ecf7';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
        if (p.r > 1.4) {                              // halo discreto nas maiores
          ctx.globalAlpha = a * .18; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3.2, 0, 6.283); ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
      flores.forEach(florzinha);
    }
    function passo(t) {
      if (!rodando) return;
      requestAnimationFrame(passo);
      if (t - ultimo < 32) return;                    // ~30 fps bastam para movimento lento
      const dt = Math.min(3, (t - ultimo) / 16.7 || 1);
      ultimo = t;
      poeira.forEach((p, i) => {
        p.y += p.vy * dt; p.x += Math.sin(p.fase + t / 2400) * p.amp * .2 * dt;
        if (p.y < -10) poeira[i] = novaPoeira(false);
      });
      flores.forEach((f, i) => {
        f.y += f.vy * dt; f.rot += f.vr * dt; f.x += Math.sin(f.fase + t / 1700) * .35 * dt;
        f.a = aberto ? Math.max(0, f.a - .02 * dt) : Math.min(1, f.a + .01 * dt);
        if (f.y > H + 20 && !aberto) flores[i] = novaFlor(false);
      });
      if (aberto) flores = flores.filter((f) => f.a > 0);
      desenhar(t);
    }
    function ligar() { if (!rodando && !reduceMotion && !document.hidden) { rodando = true; ultimo = 0; requestAnimationFrame(passo); } }
    function desligar() { rodando = false; }

    medir();
    poeira = Array.from({ length: fraco ? 26 : 44 }, () => novaPoeira(true));
    flores = Array.from({ length: fraco ? 3 : 5 }, () => novaFlor(true));
    if (reduceMotion) { flores.forEach((f) => { f.a = 1; }); desenhar(0); }
    else ligar();

    let tmr = 0;
    window.addEventListener('resize', () => { clearTimeout(tmr); tmr = setTimeout(() => { medir(); if (reduceMotion) desenhar(0); }, 150); });
    document.addEventListener('visibilitychange', () => (document.hidden ? desligar() : ligar()));

    return {
      /** depois da abertura: as florzinhas somem e fica só a poeira prateada */
      abrir() { aberto = true; if (reduceMotion) { flores = []; desenhar(0); } },
    };
  })();


  /* ------------------------------------------------------------------------
     Toque nos botões: luz que nasce no ponto tocado
     ------------------------------------------------------------------------ */
  function iniciarToques() {
    document.addEventListener('pointerdown', (e) => {
      const b = e.target.closest && e.target.closest('.btn');
      if (!b || reduceMotion) return;
      const r = b.getBoundingClientRect();
      b.style.setProperty('--x', (e.clientX - r.left) + 'px');
      b.style.setProperty('--y', (e.clientY - r.top) + 'px');
      b.classList.remove('is-rippling');
      void b.offsetWidth;                              // reinicia a animação
      b.classList.add('is-rippling');
      clearTimeout(b._rip);
      b._rip = setTimeout(() => b.classList.remove('is-rippling'), 650);
    }, { passive: true });
  }

  /* ------------------------------------------------------------------------
     Envelope: toque no lacre → lacre quebra, aba abre, cartão sobe (~2 s)
     A linha do tempo visual está em style.css (seção 2/3); estes tempos
     decidem quando a tela de detalhes entra.
     ------------------------------------------------------------------------ */
  function iniciarEnvelope() {
    const intro = $('#intro');
    const seal = $('#seal');
    const main = $('#main');
    const root = document.documentElement;
    let aberto = false;

    // movimento reduzido: sem viagem do envelope, só uma troca suave de tela
    const T0 = reduceMotion
      ? { sair: 60,   fim: 500 }
      : { sair: 2550, fim: 3400 };

    // AMBIENTAÇÃO: começa quando as fontes estiverem prontas (no máximo ~0,9 s de espera)
    let pronto = false;
    const preparar = () => { if (!pronto) { pronto = true; requestAnimationFrame(() => intro.classList.add('is-ready')); } };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(preparar, preparar);
    setTimeout(preparar, 900);

    function quebrarLacre() {
      seal.classList.add('is-breaking');
      if (reduceMotion) return;
      const caixa = $('#shards');
      for (let i = 0; i < 8; i++) {
        const s = document.createElement('span');
        const ang = Math.random() * Math.PI * 2;
        const dist = 26 + Math.random() * 38;
        const tam = 5 + Math.random() * 6;
        s.className = 'seal__shard';
        s.style.width = s.style.height = tam + 'px';
        s.style.left = s.style.top = (-tam / 2) + 'px';
        s.style.setProperty('--dx', (Math.cos(ang) * dist).toFixed(1) + 'px');
        s.style.setProperty('--dy', (Math.sin(ang) * dist * 0.6 - 10).toFixed(1) + 'px');
        s.style.setProperty('--r', Math.round(Math.random() * 540 - 270) + 'deg');
        s.style.animationDelay = Math.round(Math.random() * 80) + 'ms';
        caixa.appendChild(s);
      }
    }

    /** Chuva de brilhos que sobe do envelope quando a aba abre (poucos pontos; menos ainda em celular fraco). */
    function brilhos() {
      if (reduceMotion) return;
      const cv = $('#burst');
      const ctx = cv.getContext && cv.getContext('2d');
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = intro.clientWidth, h = intro.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.scale(dpr, dpr);
      const r = $('#envelope').getBoundingClientRect();
      const fraco = (navigator.hardwareConcurrency || 4) <= 4 || (navigator.deviceMemory || 4) <= 2;
      const cores = ['#ffffff', '#dfe5ee', '#9fb8f0'];
      const ps = Array.from({ length: fraco ? 26 : 56 }, () => {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.5, v = 2.2 + Math.random() * 4.2;
        return { x: r.left + r.width * (0.25 + Math.random() * 0.5), y: r.top + r.height * 0.3, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
                 s: 1 + Math.random() * 2.2, vida: 0, max: 60 + Math.random() * 50, c: cores[Math.floor(Math.random() * 3)] };
      });
      setTimeout(() => {                               // começa quando a aba já está levantando
        requestAnimationFrame(function passo() {
          ctx.clearRect(0, 0, w, h);
          let vivos = 0;
          ps.forEach((p) => {
            if (p.vida > p.max) return;
            vivos++; p.vida++; p.vy += 0.05; p.x += p.vx; p.y += p.vy; p.vx *= 0.992;
            ctx.globalAlpha = Math.max(0, 1 - p.vida / p.max);
            ctx.fillStyle = p.c;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.283); ctx.fill();
          });
          if (vivos) requestAnimationFrame(passo); else ctx.clearRect(0, 0, w, h);
        });
      }, 1050);
    }

    function abrir(rapido) {
      if (aberto) return;
      aberto = true;
      preparar();
      const T = rapido ? { sair: 200, fim: 650 } : T0;   // "Pular": sem a animação longa

      Music.start();                                   // tem que ser aqui, dentro do toque
      if (navigator.vibrate) { try { navigator.vibrate(16); } catch (e) { /* ignora */ } }

      if (rapido || reduceMotion) {
        intro.classList.add('is-skipping');
      } else {
        quebrarLacre();
        intro.classList.add('is-opening');
        brilhos();
      }

      setTimeout(() => {                               // dissolve o envelope e mostra os detalhes
        intro.classList.add('is-leaving');
        Ambiente.abrir();
        root.classList.add('is-open');
        root.classList.remove('is-locked');
        main.inert = false;
        main.removeAttribute('inert');
        main.removeAttribute('aria-hidden');
        window.scrollTo(0, 0);
        Reveal.iniciar();
        const h = $('#detalhes-titulo');
        if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      }, T.sair);

      setTimeout(() => { intro.hidden = true; }, T.fim);
    }

    // O lacre é um <button> (acessível por teclado); tocar em qualquer parte do envelope também abre.
    intro.addEventListener('click', () => abrir(false));
    $('#skip').addEventListener('click', (e) => { e.stopPropagation(); abrir(true); });
  }


  /* ------------------------------------------------------------------------
     Janelas (bottom sheets)
     ------------------------------------------------------------------------ */
  const Sheets = (function () {
    const main = $('#main');
    let atual = null;
    let gatilho = null;
    let fecharTimer = 0;

    // Ajusta a altura da janela quando o teclado do celular aparece (iOS e Android)
    function ajustarViewport() {
      const vv = window.visualViewport;
      if (!vv) return;
      const st = document.documentElement.style;
      st.setProperty('--vv-h', vv.height + 'px');
      st.setProperty('--vv-top', vv.offsetTop + 'px');
    }
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', ajustarViewport);
      window.visualViewport.addEventListener('scroll', ajustarViewport);
    }

    function abrir(nome, origem) {
      const el = $('#sheet-' + nome);
      if (!el) return;
      if (atual) fechar(true);
      clearTimeout(fecharTimer);
      atual = el;
      gatilho = origem || document.activeElement;

      preencherNomeSalvo();                             // quem já digitou o nome não precisa digitar de novo
      ajustarViewport();
      el.hidden = false;
      void el.offsetWidth;                              // reflow: faz a transição rodar
      el.classList.add('is-open');
      document.body.classList.add('has-sheet');
      main.inert = true;

      const painel = $('.sheet__panel', el);
      painel.setAttribute('tabindex', '-1');
      painel.scrollTop = 0;
      painel.focus({ preventScroll: true });            // foco na janela, sem abrir o teclado de cara
    }

    function fechar(rapido) {
      if (!atual) return;
      const el = atual;
      atual = null;
      el.classList.remove('is-open');
      document.body.classList.remove('has-sheet');
      main.inert = false;
      main.removeAttribute('inert');
      if (gatilho && gatilho.focus) { try { gatilho.focus({ preventScroll: true }); } catch (e) { /* ignora */ } }
      const terminar = () => { el.hidden = true; };
      if (rapido) terminar(); else fecharTimer = setTimeout(terminar, 380);
    }

    // abrir pelos botões do menu
    $$('[data-open]').forEach((b) => b.addEventListener('click', () => abrir(b.dataset.open, b)));
    // fechar: botão X, fundo escurecido ou tecla Esc
    $$('.sheet').forEach((s) => s.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) fechar(); }));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fechar(); });

    return { abrir, fechar };
  })();


  /* ------------------------------------------------------------------------
     Formulários
     ------------------------------------------------------------------------ */
  function erroCampo(input, idErro, msg) {
    const p = $('#' + idErro);
    if (msg) { p.textContent = msg; p.hidden = false; input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', idErro); input.focus(); }
    else { p.hidden = true; input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); }
  }

  /** Preenche o campo de nome (se estiver vazio) com o nome que a pessoa já digitou em outro formulário. */
  function preencherNomeSalvo() {
    const nome = Store.get('nome');
    if (!nome) return;
    ['#rsvp-nome', '#musica-de', '#recado-de'].forEach((s) => { const i = $(s); if (i && !i.value) i.value = nome; });
  }

  function iniciarFormularios() {
    preencherNomeSalvo();

    // limpa o erro assim que a pessoa volta a digitar
    $$('.field input, .field textarea').forEach((i) => {
      i.addEventListener('input', () => { const e = $('#' + i.id + '-erro'); if (e) erroCampo(i, e.id, ''); });
      // garante que o campo fique visível quando o teclado abre
      i.addEventListener('focus', () => setTimeout(() => { try { i.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' }); } catch (e) { /* ignora */ } }, 320));
    });

    /* --- Confirmar presença --- */
    const fr = $('#form-rsvp');
    const out = $('#rsvp-qtd');
    const [menos, mais] = $$('.stepper__btn', fr);
    let qtd = 1;
    const max = Math.max(1, CONFIG.rsvp.maxPessoas);
    if (max <= 1) $('#rsvp-qtd-campo').hidden = true;      // convite individual: não pergunta quantas pessoas
    function pintarQtd() {
      out.textContent = String(qtd);
      menos.disabled = qtd <= 1;
      mais.disabled = qtd >= max;
    }
    $$('.stepper__btn', fr).forEach((b) => b.addEventListener('click', () => {
      qtd = Math.min(max, Math.max(1, qtd + Number(b.dataset.step)));
      pintarQtd();
    }));
    pintarQtd();
    fr.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = clean(fr.elements.nome.value);
      if (!nome) { erroCampo(fr.elements.nome, 'rsvp-nome-erro', CONFIG.textos.erros.nome); return; }
      Store.set('nome', nome);
      enviarWhats(fill(CONFIG.mensagens.rsvp, { nome, pessoas: max > 1 ? qtd : '' }), fr);
    });

    /* --- Sugerir uma música --- */
    const fm = $('#form-musica');
    fm.addEventListener('submit', (e) => {
      e.preventDefault();
      const musica = clean(fm.elements.musica.value);
      const artista = clean(fm.elements.artista.value);
      const de = clean(fm.elements.de.value);
      if (!musica)  { erroCampo(fm.elements.musica, 'musica-nome-erro', CONFIG.textos.erros.musica); return; }
      if (!artista) { erroCampo(fm.elements.artista, 'musica-artista-erro', CONFIG.textos.erros.artista); return; }
      if (de) Store.set('nome', de);
      enviarWhats(fill(CONFIG.mensagens.musica, { musica, artista, de }), fm);
    });

    /* --- Enviar um recado --- */
    const fc = $('#form-recado');
    fc.addEventListener('submit', (e) => {
      e.preventDefault();
      const recado = String(fc.elements.recado.value || '').trim();
      const de = clean(fc.elements.de.value);
      if (!recado) { erroCampo(fc.elements.recado, 'recado-texto-erro', CONFIG.textos.erros.recado); return; }
      if (de) Store.set('nome', de);
      enviarWhats(fill(CONFIG.mensagens.recado, { recado, de: de ? '— ' + de : '' }), fc);
    });

    /* --- Agenda --- */
    $('#btn-ics').addEventListener('click', baixarICS);
    $('#btn-gcal').href = gcalUrl();
  }


  /* ------------------------------------------------------------------------
     Início
     ------------------------------------------------------------------------ */
  function iniciar() {
    renderTextos();
    renderEvento();
    renderContagem();
    renderManual();
    renderPresentes();
    iniciarEndereco();
    iniciarFormularios();
    iniciarToques();
    iniciarEnvelope();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
