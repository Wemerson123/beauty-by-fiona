// The opening card: one photo per treatment. The pills (and Previous / Next)
// swap the photo: the new one comes into focus on top while the old one waits
// underneath, so the card never goes dark in between. Photos also change on
// their own every 6.5s, measured in elapsed time (never counted ticks), and
// the clock sleeps while the hero is off screen or the tab is hidden.
const TEMPO = 6500;

const FOTOS = [
  { id: 'facials', rotulo: 'Facials', pos: '62% 38%', posM: '50% 30%', veu: 1,
    frase: 'Signature facials with Dermalogica, tailored to your skin type and what it needs today.' },
  { id: 'skin', veu: 0.62, rotulo: 'Advanced skin', pos: '70% 55%', posM: '55% 45%',
    frase: 'IPL, skin needling, Pro Power Peel and LED for pigmentation, texture and tone.' },
  { id: 'lash', veu: 0.62, rotulo: 'Lash & brow', pos: '75% 60%', posM: '60% 55%',
    frase: 'Lash lifts, tints and brow sculpting. Come without mascara if you can.' },
  { id: 'waxing', veu: 0.62, rotulo: 'Waxing', pos: '75% 55%', posM: '60% 50%',
    frase: 'Face and body waxing, plus IPL hair reduction you pay for as you go.' },
  { id: 'massage', veu: 0.62, rotulo: 'Massage', pos: '80% 50%', posM: '70% 45%',
    frase: 'Back, neck and shoulder massage with natural almond oil.' },
  { id: 'nails', veu: 0.62, rotulo: 'Nails', pos: '70% 60%', posM: '55% 55%',
    frase: 'Manicures and pedicures, finished with OPI Infinite Shine.' },
];

export function iniciarHero({ reduz } = {}) {
  const raiz = document.querySelector('[data-hero]');
  const caixa = raiz.querySelector('[data-hero-fotos]');
  const pilulas = raiz.querySelector('[data-hero-pilulas]');
  const frase = raiz.querySelector('[data-hero-frase]');
  const num = raiz.querySelector('[data-hero-num]');
  const linha = raiz.querySelector('[data-hero-linha]');
  const celular = matchMedia('(max-width: 760px)');
  const n = FOTOS.length;
  const dois = (v) => String(v).padStart(2, '0');

  let fotos = [];
  let atual = 0;
  let z = 1;
  let passado = 0;
  let pedido = 0;
  let limpa;
  let trocaFrase;
  let noAr = false;
  let naTela = true;

  const botoes = FOTOS.map((f, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pilula';
    b.textContent = f.rotulo;
    b.setAttribute('role', 'tab');
    b.addEventListener('click', () => ir(i));
    pilulas.append(b);
    return b;
  });

  pilulas.addEventListener('keydown', (e) => {
    const passo = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!passo) return;
    e.preventDefault();
    ir(atual + passo);
    botoes[atual].focus();
  });
  raiz.querySelector('[data-hero-ant]').addEventListener('click', () => ir(atual - 1));
  raiz.querySelector('[data-hero-prox]').addEventListener('click', () => ir(atual + 1));

  function carregar(i) {
    if (fotos[i]) return fotos[i];
    const f = FOTOS[i];
    const d = document.createElement('div');
    d.className = 'hero__foto';
    d.style.setProperty('--pos', f.pos);
    d.style.setProperty('--pos-m', f.posM);
    const img = new Image();
    img.alt = '';
    img.decoding = 'async';
    img.src = `./img/hero-${f.id}${celular.matches ? '-m' : ''}.webp`;
    d.append(img);
    caixa.append(d);
    const ok = new Promise((r) => {
      if (img.complete && img.naturalWidth) return r();
      img.addEventListener('load', r, { once: true });
      img.addEventListener('error', r, { once: true });
    });
    fotos[i] = { d, ok };
    return fotos[i];
  }

  function mostrar(i) {
    const { d } = fotos[i];
    d.classList.remove('is-on');
    d.style.zIndex = ++z;
    void d.offsetWidth;
    d.classList.add('is-on');
    clearTimeout(limpa);
    limpa = setTimeout(() => {
      fotos.forEach((f, j) => { if (f && j !== atual) f.d.classList.remove('is-on'); });
    }, 1100);
  }

  function pintar(animar) {
    botoes.forEach((b, i) => {
      const on = i === atual;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    num.textContent = `${dois(atual + 1)} / ${dois(n)}`;
    // The studio photo is bright and needs the full veil; the still lifes
    // already have a dark wall on the left and take a lighter one.
    raiz.style.setProperty('--veu', celular.matches ? 1 : FOTOS[atual].veu);
    clearTimeout(trocaFrase);
    if (animar && !reduz) {
      frase.classList.add('is-troca');
      trocaFrase = setTimeout(() => { frase.textContent = FOTOS[atual].frase; frase.classList.remove('is-troca'); }, 280);
    } else {
      frase.textContent = FOTOS[atual].frase;
      frase.classList.remove('is-troca');
    }
    regua();
    // Phone: keep the current pill in view by moving the pill row only. Never
    // scrollIntoView here: it would also drag the whole page back to the hero.
    if (celular.matches) {
      const b = botoes[atual];
      pilulas.scrollTo({ left: b.offsetLeft - (pilulas.clientWidth - b.offsetWidth) / 2, behavior: reduz ? 'auto' : 'smooth' });
    }
  }

  function regua() {
    linha.style.transform = `scaleX(${(atual + Math.min(passado / TEMPO, 1)) / n})`;
  }

  function ir(i) {
    i = ((i % n) + n) % n;
    if (i === atual && noAr) return;
    atual = i;
    passado = 0;
    const meu = ++pedido;
    const f = carregar(i);
    pintar(noAr);
    f.ok.then(() => { if (meu === pedido && noAr) mostrar(i); });
    carregar((i + 1) % n);
  }

  // Clock: elapsed time accumulated only while the hero is watched.
  let antes = performance.now();
  function tique(agora) {
    const dt = Math.min(agora - antes, 120);
    antes = agora;
    if (noAr && naTela && !document.hidden && !reduz) {
      passado += dt;
      if (passado >= TEMPO) ir(atual + 1);
      else regua();
    }
    requestAnimationFrame(tique);
  }
  requestAnimationFrame(tique);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { naTela = e.isIntersecting; }, { threshold: 0.25 }).observe(raiz);
  }

  celular.addEventListener('change', () => {
    fotos.forEach((f) => f && f.d.remove());
    fotos = [];
    const f = carregar(atual);
    f.ok.then(() => noAr && mostrar(atual));
  });

  const primeira = carregar(0).ok;
  pintar(false);

  return {
    primeira,
    comecar() {
      noAr = true;
      primeira.then(() => { mostrar(atual); carregar((atual + 1) % n); });
    },
    irPara(id) {
      const i = FOTOS.findIndex((f) => f.id === id);
      if (i >= 0) ir(i);
    },
  };
}
