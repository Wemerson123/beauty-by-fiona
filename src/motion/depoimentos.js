// Three reviews, one at a time. The arrow swaps the quote: the one leaving
// loses focus, the one arriving gains it and is read again, line by line.
// Clicking quickly only changes the destination; nothing restarts halfway.
export function iniciarDepoimentos({ reduz, varredura } = {}) {
  const raiz = document.querySelector('[data-depoimentos]');
  if (!raiz) return;
  const falas = [...raiz.querySelectorAll('[data-depo-fala]')];
  const trat = raiz.querySelector('[data-depo-trat]');
  const foto = raiz.querySelector('[data-depo-foto]');
  const conta = raiz.querySelector('[data-depo-conta]');
  const dois = (v) => String(v).padStart(2, '0');
  const n = falas.length;
  let atual = 0, le, troca, limpa;

  falas.forEach((f, i) => f.setAttribute('aria-hidden', i === 0 ? 'false' : 'true'));
  foto.querySelector('img').classList.add('is-on');
  falas.slice(1).forEach((f) => { const im = new Image(); im.src = f.dataset.img; });

  function ir(i) {
    i = ((i % n) + n) % n;
    if (i === atual) return;
    falas[atual].classList.remove('is-on');
    falas[atual].setAttribute('aria-hidden', 'true');
    atual = i;
    if (conta) conta.textContent = `${dois(i + 1)} / ${dois(n)}`;
    const f = falas[i];
    const p = f.querySelector('[data-varredura]');
    varredura.reiniciar(p);
    f.setAttribute('aria-hidden', 'false');
    f.classList.add('is-on');
    clearTimeout(le);
    le = setTimeout(() => varredura.tocar(p), reduz ? 0 : 260);

    clearTimeout(troca);
    trat.classList.add('is-troca');
    troca = setTimeout(() => { trat.textContent = f.dataset.trat; trat.classList.remove('is-troca'); }, reduz ? 0 : 280);

    const img = new Image();
    img.alt = '';
    img.src = f.dataset.img;
    foto.append(img);
    const entra = () => {
      void img.offsetWidth;
      img.classList.add('is-on');
      clearTimeout(limpa);
      limpa = setTimeout(() => {
        [...foto.querySelectorAll('img')].forEach((im) => { if (im !== foto.lastElementChild) im.remove(); });
      }, 1000);
    };
    if (img.complete) entra(); else img.addEventListener('load', entra, { once: true });
  }

  raiz.querySelector('[data-depo-ant]').addEventListener('click', () => ir(atual - 1));
  raiz.querySelector('[data-depo-prox]').addEventListener('click', () => ir(atual + 1));
}
