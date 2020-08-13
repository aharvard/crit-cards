import Header from '../src/components/Header.svelte';
import Main from '../src/components/Main.svelte';
import Footer from '../src/components/Footer.svelte';

export default {
  title: 'Layout',
  parameters: {
    layout: 'fullscreen',
  },
};

export const header = () => ({
  Component: Header,
});

export const main = () => ({
  Component: Main,
});

export const footer = () => ({
  Component: Footer,
});
