<script>
  import { onMount } from "svelte";
  import Card from "./Card.svelte";
  import CardBack from "./CardBack.svelte";
  import Footer from "./Footer.svelte";
  import Icon from "./Icon.svelte";
  import { cards } from "./content.js";

  $: cardsClone = [...cards];
  $: shuffledCards = [];
  $: playedCards = [];

  $: drawCount = 0;
  $: isShuffled = false;

  function shuffle(array) {
    var m = array.length,
      t,
      i;

    // While there remain elements to shuffle…
    while (m) {
      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);

      // And swap it with the current element.
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }

    return array;
  }

  function shuffleCards() {
    playedCards = [];
    cardsClone = [...cards];
    shuffle(cardsClone);
    drawCount = 0;
    setTimeout;
    isShuffled = true;
    setTimeout(() => (isShuffled = false), 750);
  }

  function drawCard() {
    shuffledCards = cardsClone;
    playedCards = [...playedCards, shuffledCards[0]];
    shuffledCards.shift();
    drawCount += 1;
    isShuffled = false;
  }

  onMount(() => {
    shuffle(cardsClone);
    isShuffled = true;
  });
</script>

<header>

  <button
    on:click={shuffleCards}
    style="--button-color: white; --button-text-color: var(--black);">
    <Icon name="shuffle" />
    Shuffle
  </button>

  <h1>Critique Cards</h1>

  {#if cardsClone.length > 0}
    <button
      on:click={drawCard}
      style="--button-color: white; --button-text-color: var(--teal)">
      <Icon name="drawCard" />
      Draw
    </button>
  {:else}
    <button on:click={drawCard} style="--button-color:var(--black);" disabled>
      <Icon name="drawCard" />
      Draw
    </button>
  {/if}

</header>

<main>
  <div class="deck" aria-live="assertive">
    {#if cardsClone.length > 0}
      <CardBack showBack={true} shuffledState={isShuffled} />
    {/if}

    {#each playedCards as card, c (card.question.replace(/\s+/g, ''))}
      <Card
        question={card.question}
        categoryFull={card.categoryFull}
        categoryShort={card.categoryShort}
        example={card.example} />
    {/each}
  </div>
</main>

<Footer />
