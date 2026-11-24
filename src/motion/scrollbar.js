// Our own scrollbar for the computer: a thread on the right edge that appears
// while the page scrolls, fades when it rests, thickens under the cursor and
// can be dragged. The native bar is hidden there (base.css) because it takes
// width and would make the hero card's right margin wider than the left.
export function iniciarScrollbar({ scroll } = {}) {
  const trilha = document.querySelector('[data-rolagem]');
  if (!trilha || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const polegar = trilha.firstElementChild;
  let some, alt = 0, max = 0, vh = 0;

  function medir() {
    vh = window.innerHeight;
    max = Math.max(document.documentElement.scrollHeight - vh, 1);
    alt = Math.max(36, (vh * vh) / (max + vh));
    polegar.style.height = `${alt}px`;
    por();
  }
  function por() {
    polegar.style.transform = `translateY(${(window.scrollY / max) * (vh - alt)}px)`;
  }
  function mostrar() {
    trilha.classList.add('is-on');
    clearTimeout(some);
    some = setTimeout(() => trilha.classList.remove('is-on'), 900);
  }

  window.addEventListener('scroll', () => { por(); mostrar(); }, { passive: true });
  window.addEventListener('resize', medir);
  if ('ResizeObserver' in window) new ResizeObserver(medir).observe(document.body);
  medir();

  let preso = false, y0 = 0, s0 = 0;
  const ir = (y) => (scroll ? scroll.para(y) : window.scrollTo(0, y));
  trilha.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (e.target !== polegar) ir(((e.clientY - alt / 2) / (vh - alt)) * max);
    preso = true; y0 = e.clientY; s0 = window.scrollY;
    trilha.classList.add('is-arrasta');
    trilha.setPointerCapture(e.pointerId);
  });
  trilha.addEventListener('pointermove', (e) => {
    if (!preso) return;
    ir(Math.min(Math.max(s0 + ((e.clientY - y0) / (vh - alt)) * max, 0), max));
  });
  const soltar = () => { preso = false; trilha.classList.remove('is-arrasta'); };
  trilha.addEventListener('pointerup', soltar);
  trilha.addEventListener('pointercancel', soltar);
}
