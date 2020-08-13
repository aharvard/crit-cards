import CardFront from './views/CardFront.svelte';
import SideBySide from './views/SideBySide.svelte';
import CardBack from './views/CardBack.svelte';
import Flipper from './views/Flipper.svelte';
// import '../public/global.css';

export default {
  title: 'Card',
  parameters: {
    layout: 'fullscreen',
  },
};

export const cardFront = () => ({
  Component: CardFront,
});

export const cardBack = () => ({
  Component: CardBack,
});

export const sideBySide = () => ({
  Component: SideBySide,
});

export const cardFlipper = () => ({
  Component: Flipper,
});
