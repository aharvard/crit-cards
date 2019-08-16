<script>
  export let showBack;
  export let shuffledState;
  let deckTitle = "Critique Cards";
</script>

<div class="card-face card-back" class:showBack class:shuffled={shuffledState}>
  <span class="corner" aria-hidden="true">{deckTitle}</span>
  <span class="corner" aria-hidden="true">{deckTitle}</span>
</div>
