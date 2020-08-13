import Button from './views/Button.svelte';
import Link from './views/Link.svelte';

export default {
  title: 'Atoms',
  parameters: {
    layout: 'fullscreen',
  },
};

export const button = () => ({
  Component: Button,
});
export const link = () => ({
  Component: Link,
});
