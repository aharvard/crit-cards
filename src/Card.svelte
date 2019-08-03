<script>
  export let cardFlipStatus;
  export let deckTitle = "Critique Cards";

  export let categoryFull = "";
  export let categoryShort = "";
  export let question = "";
  export let example = "";
</script>

<style>
  .card {
    perspective: 2000px;
    transition: 500ms all ease;
  }

  .card.flipped {
    transform: translateX(-5rem);
  }

  .card,
  .card-face {
    height: 30rem;
    width: 20rem;
  }

  .card-flipper {
    position: relative;
    transform-style: preserve-3d;
    transition: inherit;
    transform-origin: center left;
  }

  .card.flipped .card-flipper {
    transform: rotateY(-180deg);
  }

  .card-face {
    backface-visibility: hidden;
    border-radius: 1rem;
    display: grid;
    grid-template-columns: 1fr;
    left: 0;
    padding: 1.5rem;
    position: absolute;
    top: 0;
  }

  .card-front {
    background: white;
    grid-template-rows: auto 8rem 1fr auto;
    transform: rotateY(0deg);
  }

  .card-back {
    background: #222;
    background: url("card-back-texture.svg"), radial-gradient(#222, #111);
    background-size: 100%;
    grid-template-rows: auto 1fr auto;
    transform: rotateY(180deg);
  }

  .category {
    align-self: center;
    font-size: 0.8rem;
    justify-self: center;
    letter-spacing: 0.2rem;
    text-transform: uppercase;
    transform: translateY(1rem);
  }

  .category::after {
    background: red;
    content: "";
    display: block;
    height: 0.25rem;
    margin: 0.5rem auto;
    width: 2rem;
  }

  .question {
    font-size: 1.5rem;
    text-align: center;
  }

  .example {
    display: block;
    font-size: 1rem;
    margin-top: 1rem;
  }

  .corner {
    color: red;
    font-size: 2rem;
    text-transform: capitalize;
  }

  .corner ~ .corner {
    transform: rotate(180deg);
  }

  .card-back .corner {
    color: white;
    font-size: 1.2rem;
    text-transform: uppercase;
    width: 8ch;
  }

  .card-back .corner:last-child {
    justify-self: right;
  }
</style>

<div class="card" class:flipped={cardFlipStatus}>

  <div class="card-flipper">

    <div class="card-face card-front">
      <span class="corner">{categoryShort}</span>
      <p class="category">{categoryFull}</p>
      <h2 class="question">
        {question}
        {#if example != ''}
          <span class="example">{example}</span>
        {/if}
      </h2>
      <span class="corner">{categoryShort}</span>
    </div>

    <div class="card-face card-back">
      <span class="corner">{deckTitle}</span>
      <span class="corner">{deckTitle}</span>
    </div>

  </div>

</div>
