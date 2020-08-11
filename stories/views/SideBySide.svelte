<style>
  .flex {
    display: flex;
    gap: 1rem;
  }

  .flex > :global(*) {
    flex: 0 0 auto;
  }
</style>

<script>
  import CardFront from "../../src/components/CardFront.svelte";
  import CardBack from "../../src/components/CardBack.svelte";
  import Main from "../../src/components/Main.svelte";
</script>

<Main>
  <div class="flex">
    <CardFront />
    <CardBack />
  </div>
</Main>
