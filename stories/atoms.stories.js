import Button from './views/Button.svelte';
import Link from './views/Link.svelte';

export default {
  title: 'Atoms',
};

export const button = () => ({
  Component: Button,
});
export const link = () => ({
  Component: Link,
});