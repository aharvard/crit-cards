<style>
  .deck {
    display: grid;
    transform: translateX(calc((-0.5 * var(--card-width)) - 1rem))
      rotate(calc(0.5 * var(--card-rotate-offset)));
  }
  .deck > :global(*) {
    grid-row: 1 / 2;
    grid-column: 1 / 2;
  }
  .deck > :global(.card-back) {
    z-index: -100;
  }
</style>

<script>
  import { onMount } from "svelte";
  import { shuffle } from "./utils.js";
  import cardData from "./data.json";
  import "./assets/global.css";

  import Card from "./components/Card.svelte";
  import CardBack from "./components/CardBack.svelte";
  import Header from "./components/Header.svelte";
  import Main from "./components/Main.svelte";
  import Footer from "./components/Footer.svelte";

  $: deckSpent = false;

  $: deckOfCards = cardData.map((card, index) => ({
    ...card,
    drawn: false,
    id: index,
  }));
  $: undrawnCards = deckOfCards.filter((card) => !card.drawn);
  $: drawnCards = deckOfCards.filter((card) => card.drawn);

  let deckPosition = 0;

  onMount(() => shuffle(deckOfCards));

  function shuffleCards() {
    deckOfCards = shuffle(deckOfCards);
    deckOfCards.forEach((element) => {
      element.drawn = false;
    });
    deckPosition = 0;
    deckSpent = false;
  }

  function drawCard() {
    if (undrawnCards.length > 1) {
      console.log(deckPosition);
      deckOfCards[deckPosition].drawn = true;
      deckPosition += 1;
      console.log(deckPosition);
    } else {
      deckOfCards[deckPosition].drawn = true;
      deckSpent = true;
    }
  }
</script>

<Header shuffleClick="{shuffleCards}" drawClick="{drawCard}" {deckSpent} />
<Main>
  <div class="deck">
    {#if undrawnCards.length > 0}
      <CardBack />
    {/if}
    {#each drawnCards as card, i (card.id)}
      <Card
        category="{card.category}"
        question="{card.question}"
        example="{card.example || null}"
        index="{i}"
        id="{card.id}"
        drawn="{card.drawn}"
      />
    {/each}
  </div>
</Main>
<Footer />
