// Entrance in focus. A piece marked data-foco starts transparent, blurred and
// 26px low (base.css); when it enters the window it settles. Its delay is its
// own --i times 85ms. Once the entrance is over the mark comes off, so the
// piece's own hover transitions are free again.
export function iniciarFoco({ reduz } = {}) {
  const pecas = [...document.querySelectorAll('[data-foco]')];
  if (reduz || !('IntersectionObserver' in window)) {
    pecas.forEach((el) => el.removeAttribute('data-foco'));
    return;
  }
  const mostrar = (el) => {
    el.classList.add('is-foco');
    const i = parseFloat(getComputedStyle(el).getPropertyValue('--i')) || 0;
    setTimeout(() => {
      el.removeAttribute('data-foco');
      el.classList.remove('is-foco');
    }, i * 85 + 1200);
  };
  const io = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      mostrar(e.target);
    }
  }, { rootMargin: '0px 0px -5% 0px', threshold: 0.06 });
  pecas.forEach((el) => io.observe(el));
}
