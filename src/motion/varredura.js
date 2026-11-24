// The sentence that reads itself. Each [data-varredura] is measured on screen
// and rebuilt as one block per line; the ink then passes left to right, line
// by line, with a tip in the accent colour (the gradient lives in base.css and
// moves through the registered --p property). It runs on time, when the
// sentence enters the window, never tied to the scroll position, so scrolling
// fast can't leave half a word.
const DURA = 900;
const ATRASO = 220;

export function iniciarVarredura({ reduz } = {}) {
  const itens = [...document.querySelectorAll('[data-varredura]')].map((el) => ({
    el,
    texto: el.textContent.trim().replace(/\s+/g, ' '),
    estado: reduz ? 'lida' : 'nova',
    linhas: [],
    relogios: [],
  }));
  const de = (el) => itens.find((it) => it.el === el);

  function montar(it) {
    const { el } = it;
    if (el.offsetParent === null) return;
    el.classList.remove('is-pronta');
    el.textContent = '';
    const palavras = it.texto.split(' ').map((p) => {
      const s = document.createElement('span');
      s.textContent = p;
      return s;
    });
    palavras.forEach((s, i) => { el.append(s); if (i < palavras.length - 1) el.append(' '); });
    const grupos = [];
    let topo = null;
    for (const s of palavras) {
      const t = s.offsetTop;
      if (topo === null || Math.abs(t - topo) > 4) { grupos.push([]); topo = t; }
      grupos[grupos.length - 1].push(s.textContent);
    }
    el.textContent = '';
    it.linhas = grupos.map((g, i) => {
      const l = document.createElement('span');
      l.className = 'vl' + (it.estado === 'lida' ? ' is-lida' : '');
      l.textContent = g.join(' ') + (i < grupos.length - 1 ? ' ' : '');
      el.append(l);
      return l;
    });
    el.classList.add('is-pronta');
  }

  function parar(it) { it.relogios.forEach(clearTimeout); it.relogios = []; }

  function tocar(el) {
    const it = de(el);
    if (!it || it.estado !== 'nova') return;
    if (!it.linhas.length) montar(it);
    it.estado = 'lendo';
    const assina = el.dataset.assina && document.querySelector(el.dataset.assina);
    it.linhas.forEach((l, i) => {
      it.relogios.push(setTimeout(() => {
        l.classList.add('is-lendo');
        if (assina && i === it.linhas.length - 1) assina.classList.add('is-on');
      }, i * ATRASO));
    });
    it.relogios.push(setTimeout(() => {
      it.estado = 'lida';
      it.linhas.forEach((l) => { l.classList.remove('is-lendo'); l.classList.add('is-lida'); });
    }, (it.linhas.length - 1) * ATRASO + DURA + 80));
  }

  function reiniciar(el) {
    const it = de(el);
    if (!it || reduz) return;
    parar(it);
    it.estado = 'nova';
    montar(it);
  }

  function refazer() {
    for (const it of itens) {
      if (it.estado === 'lendo') { parar(it); it.estado = 'lida'; }
      montar(it);
    }
  }

  itens.forEach(montar);

  if (reduz) {
    document.querySelectorAll('.assinatura').forEach((a) => a.classList.add('is-on'));
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        // Reviews that are not on screen yet are played by depoimentos.js.
        const fala = e.target.closest('[data-depo-fala]');
        if (fala && !fala.classList.contains('is-on')) continue;
        tocar(e.target);
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.3 });
    itens.forEach((it) => io.observe(it.el));
  } else {
    itens.forEach((it) => tocar(it.el));
  }

  let largura = window.innerWidth;
  let espera;
  window.addEventListener('resize', () => {
    if (window.innerWidth === largura) return;
    largura = window.innerWidth;
    clearTimeout(espera);
    espera = setTimeout(refazer, 160);
  });

  return { tocar, reiniciar, refazer };
}
