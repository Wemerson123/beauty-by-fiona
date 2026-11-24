// Scrolling. On a computer (a fine pointer) the page scrolls smoothly with
// Lenis and anchor links glide to their section; on touch the scroll is the
// device's own. Treatment links in the footer go back up to the hero already
// showing that treatment's photo.
import Lenis from 'lenis';

export function iniciarScroll({ reduz, hero } = {}) {
  const fino = matchMedia('(hover: hover) and (pointer: fine)').matches;
  let lenis = null;
  if (fino && !reduz) {
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, autoRaf: true, anchors: false });
  }

  function ate(alvo) {
    const el = typeof alvo === 'string' ? document.querySelector(alvo) : alvo;
    if (!el) return;
    const topo = el.id === 'top';
    if (lenis) lenis.scrollTo(topo ? 0 : el, { duration: 1.25, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else window.scrollTo({ top: topo ? 0 : el.getBoundingClientRect().top + window.scrollY, behavior: reduz ? 'auto' : 'smooth' });
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute('data-folha-contato')) return;
    const alvo = document.querySelector(a.getAttribute('href'));
    if (!alvo) return;
    e.preventDefault();
    if (a.dataset.trat && hero) hero.irPara(a.dataset.trat);
    ate(alvo);
  });

  return {
    lenis,
    ate,
    parar: () => lenis && lenis.stop(),
    seguir: () => lenis && lenis.start(),
    para: (y) => (lenis ? lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y)),
  };
}
