<style>
  header {
    text-align: center;
    display: flex;
    align-items: center;
    background: white;
    padding: 1rem;
    min-height: var(--header-height);
  }
  h1 {
    flex: 1 1 auto;
    margin: 0;
    text-align: center;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 1rem;
  }
</style>

<script>
  export let shuffleClick;
  export let drawClick;
  export let deckSpent;
  import Button from "./Button.svelte";
</script>

<header>
  <Button on:click="{shuffleClick}" text="Shuffle" icon="shuffle" />
  <h1>Critiqe Cards</h1>
  <Button on:click="{drawClick}" text="Draw Card" disabledState="{deckSpent}" />
</header>
