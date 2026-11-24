// The row of cards that scrolls sideways. On a computer it moves with the
// arrows, by dragging with the mouse (with a little momentum on release), with
// the trackpad and with the keyboard arrows. On touch it is plain native
// horizontal scrolling: no arrows, no snapping, and it never scrolls
// vertically inside itself.
export function iniciarTrilho({ reduz } = {}) {
  const t = document.querySelector('[data-trilho]');
  if (!t) return;
  const ant = document.querySelector('[data-trilho-ant]');
  const prox = document.querySelector('[data-trilho-prox]');
  const suave = reduz ? 'auto' : 'smooth';
  const passo = () => {
    const c = t.querySelector('.cartao');
    return c ? c.getBoundingClientRect().width + 14 : 320;
  };

  const pontas = () => {
    const max = t.scrollWidth - t.clientWidth;
    ant.disabled = t.scrollLeft <= 2;
    prox.disabled = t.scrollLeft >= max - 2;
  };
  t.addEventListener('scroll', pontas, { passive: true });
  window.addEventListener('resize', pontas);
  pontas();

  ant.addEventListener('click', () => t.scrollBy({ left: -passo(), behavior: suave }));
  prox.addEventListener('click', () => t.scrollBy({ left: passo(), behavior: suave }));
  t.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    t.scrollBy({ left: e.key === 'ArrowRight' ? passo() : -passo(), behavior: suave });
  });

  // Sideways trackpad gestures belong to the row, not to the page's smooth scroll.
  t.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    const max = t.scrollWidth - t.clientWidth;
    if ((e.deltaX < 0 && t.scrollLeft <= 0) || (e.deltaX > 0 && t.scrollLeft >= max)) return;
    e.preventDefault();
    e.stopPropagation();
    t.scrollLeft += e.deltaX;
  }, { passive: false });

  // Mouse drag with momentum.
  let preso = false, moveu = false, x0 = 0, s0 = 0, ultimoX = 0, ultimoT = 0, vel = 0, embalo;
  t.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    preso = true; moveu = false;
    x0 = ultimoX = e.clientX; s0 = t.scrollLeft; ultimoT = performance.now(); vel = 0;
    cancelAnimationFrame(embalo);
  });
  window.addEventListener('pointermove', (e) => {
    if (!preso) return;
    const dx = e.clientX - x0;
    if (!moveu && Math.abs(dx) < 5) return;
    if (!moveu) { moveu = true; t.classList.add('is-arrasta'); }
    const agora = performance.now();
    const dt = agora - ultimoT;
    if (dt > 0) vel = 0.7 * vel + 0.3 * ((ultimoX - e.clientX) / dt);
    ultimoX = e.clientX; ultimoT = agora;
    t.scrollLeft = s0 - dx;
  });
  const soltar = () => {
    if (!preso) return;
    preso = false;
    t.classList.remove('is-arrasta');
    if (!moveu || reduz) return;
    let v = vel * 16;
    let antes = performance.now();
    const desliza = (agora) => {
      const dt = Math.min(agora - antes, 40); antes = agora;
      t.scrollLeft += v * (dt / 16);
      v *= Math.pow(0.94, dt / 16);
      if (Math.abs(v) > 0.3) embalo = requestAnimationFrame(desliza);
    };
    embalo = requestAnimationFrame(desliza);
  };
  window.addEventListener('pointerup', soltar);
  window.addEventListener('pointercancel', soltar);
  t.addEventListener('dragstart', (e) => e.preventDefault());

  // A small "Drag" badge follows the mouse over the row (it replaces the
  // native cursor there). It eases toward the pointer on elapsed time.
  const selo = document.querySelector('[data-cursor]');
  if (selo && !reduz && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let alvoX = 0, alvoY = 0, x = 0, y = 0, dentro = false, rodando = false, ultimo = 0;
    const passoSelo = (agora) => {
      const k = 1 - Math.pow(0.001, Math.min(agora - ultimo, 50) / 260);
      ultimo = agora;
      x += (alvoX - x) * k; y += (alvoY - y) * k;
      selo.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(var(--s, 1))`;
      if (dentro || Math.abs(alvoX - x) > 0.5 || Math.abs(alvoY - y) > 0.5) requestAnimationFrame(passoSelo);
      else rodando = false;
    };
    const rolavel = () => t.scrollWidth - t.clientWidth > 4;
    t.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || !rolavel()) return;
      dentro = true; alvoX = x = e.clientX; alvoY = y = e.clientY;
      t.classList.add('tem-cursor'); selo.classList.add('is-on');
      if (!rodando) { rodando = true; ultimo = performance.now(); requestAnimationFrame(passoSelo); }
    });
    t.addEventListener('pointermove', (e) => { alvoX = e.clientX; alvoY = e.clientY; });
    t.addEventListener('pointerleave', () => { dentro = false; selo.classList.remove('is-on'); t.classList.remove('tem-cursor'); });
    t.addEventListener('pointerdown', () => selo.classList.add('is-preso'));
    window.addEventListener('pointerup', () => selo.classList.remove('is-preso'));
  }
}
