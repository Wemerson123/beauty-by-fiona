// A slow parallax on the large photos: as the page scrolls, the picture moves
// a few percent inside its frame, so the frames feel like windows. Computer
// only (fine pointer), never with reduced motion. One measurement per frame.
export function iniciarParalaxe({ reduz } = {}) {
  if (reduz || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const itens = [...document.querySelectorAll('[data-paralaxe]')]
    .map((el) => ({ el, img: el.querySelector('img'), forca: parseFloat(el.dataset.paralaxe) || 4 }))
    .filter((it) => it.img);
  if (!itens.length) return;
  itens.forEach((it) => { it.img.style.willChange = 'transform'; });

  let marcado = false;
  function medir() {
    marcado = false;
    const vh = window.innerHeight;
    for (const it of itens) {
      const r = it.el.getBoundingClientRect();
      if (r.bottom < -120 || r.top > vh + 120) continue;
      // -1 when the frame enters at the bottom, +1 when it leaves at the top
      const p = Math.max(-1, Math.min(1, (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2)));
      it.img.style.transform = `translate3d(0, ${(p * it.forca).toFixed(2)}%, 0) scale(${(1 + it.forca / 40).toFixed(3)})`;
    }
  }
  const pedir = () => { if (!marcado) { marcado = true; requestAnimationFrame(medir); } };
  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
  medir();
}
