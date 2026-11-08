/**
 * The hero words act out what they say (CSS in Hero.astro). They play once on arrival; this
 * replays a word's little scene when it is hovered with a mouse or tapped. Nothing runs with
 * reduced motion, and nothing replays while a scene is still playing.
 */
export function mountHeroWords(root: ParentNode = document) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('getAnimations' in Element.prototype)) return;
  // Each animation's delay within its own scene (the arrival delays include the stagger).
  const local = new WeakMap<Animation, number>();

  root.querySelectorAll<HTMLElement>('[data-scene]').forEach((word) => {
    let base: number | null = null; // read on first use, not at start-up (no early style work)
    const play = () => {
      if (!document.documentElement.classList.contains('js-motion')) return;
      base ??= (parseFloat(getComputedStyle(word).getPropertyValue('--t0')) || 0) * 1000;
      const anims = word.getAnimations({ subtree: true });
      if (anims.some((a) => a.playState === 'running')) return;
      for (const a of anims) {
        const effect = a.effect;
        if (!effect) continue;
        if (!local.has(a)) local.set(a, Math.max(0, Number(effect.getTiming().delay ?? 0) - base!));
        a.cancel();
        effect.updateTiming({ delay: local.get(a) });
        a.play();
      }
    };
    word.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && play());
    word.addEventListener('pointerdown', (e) => e.pointerType !== 'mouse' && play());
  });
}
