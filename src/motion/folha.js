// The reading sheet. A question card opens its text in a <dialog> over the
// page: the page behind blurs and darkens and the sheet rises into focus.
// It closes on the X, on Esc, on a click outside, or on the button at the end
// (which leads to the contact section). While it is open the page behind does
// not scroll.
export function iniciarFolha({ scroll } = {}) {
  const dialogo = document.querySelector('[data-folha-dialog]');
  if (!dialogo || typeof dialogo.showModal !== 'function') return;
  const corpo = dialogo.querySelector('[data-folha-corpo]');
  corpo.setAttribute('data-lenis-prevent', '');
  let fechando;

  function abrir(id) {
    const molde = document.getElementById(id);
    if (!molde) return;
    clearTimeout(fechando);
    corpo.replaceChildren(molde.content.cloneNode(true));
    corpo.scrollTop = 0;
    document.documentElement.classList.add('folha-aberta');
    scroll && scroll.parar();
    if (!dialogo.open) dialogo.showModal();
    void dialogo.offsetWidth;
    dialogo.classList.add('is-on');
  }

  function fechar(depois) {
    if (!dialogo.open) return;
    dialogo.classList.remove('is-on');
    clearTimeout(fechando);
    fechando = setTimeout(() => {
      dialogo.close();
      document.documentElement.classList.remove('folha-aberta');
      scroll && scroll.seguir();
      if (depois) depois();
    }, 420);
  }

  document.querySelectorAll('[data-folha]').forEach((b) => b.addEventListener('click', () => abrir(b.dataset.folha)));
  dialogo.querySelector('[data-folha-fechar]').addEventListener('click', () => fechar());
  dialogo.addEventListener('cancel', (e) => { e.preventDefault(); fechar(); });
  dialogo.addEventListener('click', (e) => { if (e.target === dialogo) fechar(); });
  dialogo.querySelector('[data-folha-contato]').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    fechar(() => scroll && scroll.ate('#contact'));
  });
}
