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
  $: shuffledCardCount = 0;

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
    shuffledCardCount = cardsClone.length;
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
    shuffledCardCount -= 1;
    isShuffled = false;
  }

  function cardClick() {
    if (cardsClone.length > 0) {
      drawCard();
    } else {
      shuffleCards();
    }
  }

  onMount(() => {
    shuffle(cardsClone);
    isShuffled = true;
    shuffledCardCount = cardsClone.length;
  });
</script>

<header>

  <button
    on:click={shuffleCards}
    style="--button-color: white; --button-text-color: var(--purple);">
    <Icon name="shuffle" />
    Shuffle
  </button>

  <h1>Critique Cards</h1>

  <button
    on:click={drawCard}
    style="--button-color: white; --button-text-color: var(--teal)"
    disabled={shuffledCardCount == 0}>
    <Icon name="drawCard" />
    Draw
  </button>

</header>

<main>
  <div class="deck" aria-live="assertive" on:click={cardClick}>

    <h2
      class:hide={shuffledCardCount > 0}
      class:display-none={shuffledCardCount > 1}>
      Time for a shuffle!
    </h2>

    {#if cardsClone.length > 0}
      <CardBack showBack={true} shuffledState={isShuffled} />
    {/if}

    <h2 class:hide={drawCount !== 0} class:display-none={drawCount > 1}>
      Draw a card!
    </h2>

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
