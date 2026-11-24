// Entry point. Nothing has a transition until the page has settled: we wait for
// the fonts and the first hero photo (or 1.2s, whichever comes first) and only
// then switch on `assentou`, which gives the [data-foco] pieces their
// transitions. Without that lock the pieces flicker on first paint.
// Timers, not requestAnimationFrame, drive the settle: a hidden tab parks rAF
// and would leave the page blank.
import { iniciarHero } from './motion/hero.js';
import { iniciarScroll } from './motion/scroll.js';
import { iniciarFoco } from './motion/foco.js';
import { iniciarVarredura } from './motion/varredura.js';
import { iniciarBarras } from './motion/barras.js';
import { iniciarTrilho } from './motion/trilho.js';
import { iniciarDepoimentos } from './motion/depoimentos.js';
import { iniciarFolha } from './motion/folha.js';
import { iniciarBarra } from './motion/barra.js';
import { iniciarScrollbar } from './motion/scrollbar.js';
import { iniciarParalaxe } from './motion/paralaxe.js';

const html = document.documentElement;
const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;

const hero = iniciarHero({ reduz });
const scroll = iniciarScroll({ reduz, hero });
iniciarTrilho({ reduz });
iniciarFolha({ scroll });
iniciarBarra();
iniciarScrollbar({ scroll });
iniciarParalaxe({ reduz });

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fontes = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();

Promise.race([Promise.all([fontes, hero.primeira]), espera(1200)]).then(() => {
  const varredura = iniciarVarredura({ reduz });
  html.classList.add('assentou');
  void html.offsetWidth;
  setTimeout(() => {
    hero.comecar();
    iniciarFoco({ reduz });
    iniciarBarras({ reduz });
    iniciarDepoimentos({ reduz, varredura });
  }, 30);
  // Late fonts change line breaks: measure the sentences again.
  fontes.then(() => varredura.refazer());
});
