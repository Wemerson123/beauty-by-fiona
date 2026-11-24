// The sticky bar: only after the hero, and only while the visitor scrolls up.
// It hides again on the way down and marks the section the page is on.
export function iniciarBarra() {
  const barra = document.querySelector('[data-barra]');
  const hero = document.querySelector('[data-hero]');
  if (!barra || !hero) return;
  const links = [...barra.querySelectorAll('[data-secao]')];
  const secoes = [...document.querySelectorAll('[data-secao-id]')];
  let antes = window.scrollY, acumulado = 0, marcado = false;

  function ver() {
    const y = window.scrollY;
    const d = y - antes;
    antes = y;
    if (!marcado) { marcado = true; requestAnimationFrame(marcar); }
    if (y < hero.offsetHeight - 40) { barra.classList.remove('is-on'); acumulado = 0; return; }
    if (Math.sign(d) !== Math.sign(acumulado)) acumulado = 0;
    acumulado += d;
    if (acumulado < -24) barra.classList.add('is-on');
    else if (acumulado > 12) barra.classList.remove('is-on');
  }

  function marcar() {
    marcado = false;
    const meio = window.innerHeight * 0.42;
    let aqui = null;
    for (const s of secoes) if (s.getBoundingClientRect().top <= meio) aqui = s.dataset.secaoId;
    links.forEach((a) => a.classList.toggle('is-aqui', a.dataset.secao === aqui));
  }

  window.addEventListener('scroll', ver, { passive: true });
  barra.addEventListener('focusin', () => { if (window.scrollY > hero.offsetHeight) barra.classList.add('is-on'); });
}
