<script>
  import { onMount } from "svelte";
  import Card from "./Card.svelte";
  import { cards } from "./content.js";

  let cardFlipped = false;
  let randomCard = randomPick(cards);
  let dynamicQuestion;
  let dynamicCategoryFull;
  let dynamicCategoryShort = "Hc";
  let dynamicExample = "hard coded";

  let audio = new Audio("card-flip.mp3");

  function flipCard() {
    cardFlipped = !cardFlipped;
    audio.volume = 0.1;

    setTimeout(function() {
      audio.play();
    }, 120);
  }

  function randomPick(myArray) {
    return myArray[Math.floor(Math.random() * myArray.length)];
  }

  function changeContent() {
    randomCard = randomPick(cards);
    dynamicQuestion = randomCard.question;
    dynamicCategoryFull = randomCard.categoryFull;
    dynamicCategoryShort = randomCard.categoryShort;
    console.log(dynamicQuestion);
  }

  onMount(() => {
    changeContent();
  });
</script>

<style>
  .deck {
    display: grid;
    place-content: center;
    margin: auto;
  }
</style>

<button on:click={flipCard}>Flip</button>
<button on:click={changeContent}>Change Content</button>

<div class="deck">

  <Card
    cardFlipStatus={cardFlipped}
    question={dynamicQuestion}
    categoryFull={dynamicCategoryFull}
    categoryShort={dynamicCategoryShort}
    example={dynamicExample} />

  <Card cardFlipStatus={true} />
</div>
