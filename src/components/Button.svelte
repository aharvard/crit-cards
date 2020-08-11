<style>
  button {
    appearance: none;
    font-size: 1rem;
    border: none;
    font-weight: 700;
    cursor: pointer;
    background: white;

    border-radius: 0.25em;
    padding: 0.75rem;
    display: inline-flex;
    align-items: center;
    letter-spacing: 0.025em;
    transition: all 250ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  @media (hover: hover) {
    button:hover,
    button:focus {
      transform: scale(1.1);
    }

    button:disabled:hover {
      transform: scale(1);
    }
    button:hover :global(.icon),
    button:focus :global(.icon) {
      transform: scale(1.2) rotate(-10deg);
    }
    button:disabled:hover :global(.icon) {
      transform: scale(1) rotate(0deg);
    }
  }

  button:active {
    transform: scale(1);
  }

  button:disabled {
    visibility: hidden;
  }

  button :global(.icon) {
    margin-right: 0.5rem;
    font-size: 150%;
    transition: inherit;
  }

  button:active :global(.icon) {
    transform: scale(1) rotate(0deg);
  }
</style>

<script>
  import Icon from "./Icon.svelte";
  export let text = "Button Text";
  export let icon = "drawCard";
  export let disabledState;
</script>

<button on:click disabled="{disabledState}">
  <Icon name="{icon}" />
  {text}
</button>
