// Vanilla "fly to pouch" animation: launches a thumbnail from the source element to the
// header pouch trigger, then pulses the pouch. Call from a click handler (client only).
export function flyToPouch(source: Element | null, image?: string) {
  if (typeof window === 'undefined') return;
  const pouch = document.getElementById('pouch-trigger');
  if (!source || !pouch) {
    if (pouch) pulsePouch(pouch);
    return;
  }
  const from = source.getBoundingClientRect();
  const to = pouch.getBoundingClientRect();
  const size = 64;
  const fromCx = from.left + from.width / 2;
  const fromCy = from.top + from.height / 2;

  const ghost = document.createElement(image ? 'img' : 'div');
  ghost.className = 'fly-to-pouch';
  ghost.style.width = `${size}px`;
  ghost.style.height = `${size}px`;
  ghost.style.left = `${fromCx - size / 2}px`;
  ghost.style.top = `${fromCy - size / 2}px`;
  if (image) {
    (ghost as HTMLImageElement).src = image;
    (ghost as HTMLImageElement).alt = '';
  }
  document.body.appendChild(ghost);
  // reflow so the transition runs from the start position
  void ghost.offsetWidth;

  const dx = to.left + to.width / 2 - fromCx;
  const dy = to.top + to.height / 2 - fromCy;
  ghost.style.transform = `translate(${dx}px, ${dy}px) scale(0.12)`;
  ghost.style.opacity = '0';

  pulsePouch(pouch);
  window.setTimeout(() => ghost.remove(), 680);
}

function pulsePouch(pouch: HTMLElement) {
  pouch.classList.remove('is-pulsing'); // restart if already running
  void pouch.offsetWidth;
  pouch.classList.add('is-pulsing');
  window.setTimeout(() => pouch.classList.remove('is-pulsing'), 650);
}
