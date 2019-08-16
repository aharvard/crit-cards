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

  // let audio = new Audio("card-flip.mp3");
  // function flipCard() {
  //   cardFlipped = !cardFlipped;
  //   audio.volume = 0.1;

  //   setTimeout(function() {
  //     audio.play();
  //   }, 120);
  // }

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
    // let shuffledCards = [...shuffledCards];
    // console.table("cardsClone: " + cardsClone.length);
  }

  function drawCard() {
    shuffledCards = cardsClone;
    playedCards = [...playedCards, shuffledCards[0]];
    shuffledCards.shift();
  }

  onMount(() => {
    shuffle(cardsClone);
  });
</script>

<header>
  <h1>Critique Cards</h1>
  <div class="buttons">
    <button on:click={shuffleCards}>
      <Icon name="shuffle" />
      Shuffle
    </button>
    <button on:click={drawCard}>
      <Icon name="drawCard" />
      Draw
    </button>

  </div>
</header>

<main>
  <div class="deck">
    <CardBack showBack={true} />
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
