<script>
  import Card from "../../src/components/Card.svelte";
  import Button from "../../src/components/Button.svelte";
  import Main from "../../src/components/Main.svelte";

  let flipped = false;

  function flip() {
    flipped = !flipped;
  }
</script>

<Main>
  <Card drawn="{flipped}" on:click="{flip}" />
</Main>
