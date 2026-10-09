/* Vídeo de fundo do topo (Vimeo).
   - A foto aparece primeiro; o player do Vimeo só é carregado na primeira
     interação do visitante (mover o mouse, tocar, rolar ou usar o teclado).
     Assim o carregamento inicial continua leve e a nota do PageSpeed não cai.
   - O vídeo só fica visível quando começa a tocar. Se o Vimeo falhar,
     a foto continua no lugar e nenhum erro aparece para o visitante.
   - Não carrega para quem pede "reduzir movimento" ou "economia de dados". */
(function () {
  var hero = document.querySelector('.hero');
  var videoId = hero && hero.getAttribute('data-vimeo');
  var layer = hero && hero.querySelector('.hero__video');
  if (!videoId || !layer) return;

  var connection = navigator.connection || {};
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || connection.saveData) return;

  var VIMEO_ORIGIN = 'https://player.vimeo.com';
  var triggers = ['pointermove', 'pointerdown', 'touchstart', 'scroll', 'wheel', 'keydown'];
  var iframe;

  function sendToPlayer(method, value) {
    iframe.contentWindow.postMessage(JSON.stringify({ method: method, value: value }), VIMEO_ORIGIN);
  }

  function onPlayerMessage(event) {
    if (event.origin !== VIMEO_ORIGIN || !iframe || event.source !== iframe.contentWindow) return;

    var data = event.data;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch (e) { return; }
    }
    if (!data) return;

    if (data.event === 'ready') {
      sendToPlayer('addEventListener', 'play');
      sendToPlayer('addEventListener', 'timeupdate');
    } else if (data.event === 'play' || data.event === 'timeupdate') {
      layer.classList.add('is-playing');
      window.removeEventListener('message', onPlayerMessage);
    }
  }

  function loadVideo() {
    triggers.forEach(function (type) {
      window.removeEventListener(type, loadVideo, { passive: true });
    });

    iframe = document.createElement('iframe');
    iframe.src = VIMEO_ORIGIN + '/video/' + videoId +
      '?background=1&autoplay=1&loop=1&muted=1&dnt=1&title=0&byline=0&portrait=0';
    iframe.title = 'Vídeo de treinos do Vitor L. Personal';
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.setAttribute('tabindex', '-1');

    window.addEventListener('message', onPlayerMessage);
    layer.appendChild(iframe);
  }

  triggers.forEach(function (type) {
    window.addEventListener(type, loadVideo, { passive: true });
  });
})();
