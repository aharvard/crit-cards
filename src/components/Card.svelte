<style>
  .card {
    perspective: 1000px;
    width: 320px;
    height: 480px;
    cursor: pointer;
    z-index: var(--card-z-index-start);
  }
  @media (max-width: 768px) {
    .card {
      --card-flip-offset: -10vw;
    }
  }

  .flipped.card {
    animation: cardSlide var(--card-flip-speed) ease both;
  }

  @keyframes cardSlide {
    0% {
      z-index: var(--card-z-index-start);
    }
    20% {
      z-index: 0;
    }
    100% {
      z-index: 0;
    }
  }

  .card-flipper {
    transform-style: preserve-3d;
    position: relative;
  }

  .flipped .card-flipper {
    animation: flipper calc(0.9 * var(--card-flip-speed)) ease both;
    /* animation-delay: 100ms; */
  }

  @keyframes flipper {
    from {
      transform: rotateY(0deg) rotate(0deg);
      transform-origin: center right;
    }
    to {
      transform: rotateY(180deg) rotate(var(--card-rotate-offset));
      transform-origin: calc(1rem + var(--card-width)) center;
    }
  }

  .card-flipper :global(.card-front) {
    backface-visibility: hidden;
    position: absolute;
    top: 0;
    left: 0;
    transform: rotateY(180deg);
    z-index: 2;
  }

  .card-flipper :global(.card-back) {
    backface-visibility: hidden;
    position: absolute;
    top: 0;
    left: 0;
    transform: rotateY(0deg);
  }
</style>

<script>
  import CardBack from "./CardBack.svelte";
  import CardFront from "./CardFront.svelte";

  export let category = "category";
  export let question = "question";
  export let example;
  export let index = 0;
  export let drawn;
  export let id;
</script>

<div
  class="card"
  class:flipped="{drawn}"
  style="--card-z-index-start:{-1 * (index + 1)}"
  {index}
  {id}
  on:click
>
  <div class="card-flipper">
    <CardBack />
    <CardFront {category} {question} {example} />
  </div>
</div>
