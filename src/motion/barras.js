// Bars that fill from the bottom, one after the other: the opening-hours
// columns on the first-visit card and the three columns of the massage card.
// The number on the card counts up over the same stretch of time.
export function iniciarBarras({ reduz } = {}) {
  const grupos = [...document.querySelectorAll('[data-barras], [data-colunas]')];
  grupos.forEach((g) => g.querySelectorAll('.dia, .coluna').forEach((c, i) => {
    c.querySelector('i').style.setProperty('--n', i);
  }));

  const contar = (el) => {
    const fim = Number(el.dataset.conta);
    if (reduz) { el.textContent = fim; return; }
    const dura = 1300;
    const inicio = performance.now();
    el.textContent = '0';
    const passo = (agora) => {
      const t = Math.min((agora - inicio) / dura, 1);
      el.textContent = Math.round(fim * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
    setTimeout(() => { el.textContent = fim; }, dura + 200);
  };

  const ligar = (g) => {
    g.classList.add('is-on');
    g.querySelectorAll('[data-conta]').forEach(contar);
  };

  if (!('IntersectionObserver' in window)) { grupos.forEach(ligar); return; }
  const io = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      ligar(e.target);
    }
  }, { threshold: 0.45 });
  grupos.forEach((g) => io.observe(g));
}
