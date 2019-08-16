<script>
  import { onMount } from "svelte";
  import { onDestroy } from "svelte";
  import { beforeUpdate } from "svelte";

  import CardBack from "./CardBack.svelte";

  export let categoryFull = "";
  export let categoryShort = "";
  export let question = "";
  export let example = "";

  export let className = "";

  let shuffle = false;

  onMount(() => {
    console.log("card mounted");
  });

  onDestroy(() => {
    console.log("the component is being destroyed");
    shuffle = false;
  });
</script>

<div class={'card category-' + categoryShort.toLowerCase() + ' ' + className}>
  <div class="card-flipper" class:shuffle>

    <div class="card-face card-front">
      <span class="corner" aria-hidden="true">{categoryShort}</span>
      <p class="category">{categoryFull}</p>
      <h2 class="question">
        {question}
        {#if example !== undefined}
          <span class="example">{example}</span>
        {/if}
      </h2>
      <span class="corner" aria-hidden="true">{categoryShort}</span>
    </div>

    <CardBack />

  </div>
</div>
