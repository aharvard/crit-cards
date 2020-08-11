import Header from '../src/components/Header.svelte';
import Main from '../src/components/Main.svelte';
import Footer from '../src/components/Footer.svelte';
import '../public/global.css';

export default {
  title: 'Layout',
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
