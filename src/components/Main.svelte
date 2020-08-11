<style>
  main {
    background: var(--gray);
    min-height: calc(100vh - var(--header-height));
    display: grid;
    place-content: center;
    z-index: 0;
    overflow: hidden;
  }

  main > :global(*) {
    grid-column: 1 / 2;
    grid-row: 1 / 2;
  }
</style>

<script>
  import Button from "./Button.svelte";
</script>

<main>
  <slot>Main Content</slot>
</main>
