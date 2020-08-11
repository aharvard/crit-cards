<style>
  .card-front {
    overflow: hidden;
    border-radius: var(--card-border-radius);
    padding: var(--card-padding);
    width: var(--card-width);
    height: var(--card-height);
    background: #f7f7f7;
    display: flex;
    flex-direction: column;
    border: 2px solid #eee;
  }
  .card-front * {
    user-select: none;
  }

  .category {
    margin: 0;
    text-align: center;
    align-self: center;
  }

  .category::after {
    display: block;
    content: "";
    height: 0.15em;
    width: 80%;
    margin: auto;
    background: var(--category-color);
    margin-top: 0.25em;
  }
  .question {
    text-align: center;
    justify-self: flex-end;
    margin: 1rem 0 0;
  }

  .example {
    margin: 1rem 0 0;
    flex: 0.25 0.25 auto;
    text-align: center;
  }

  .category-abreviation {
    flex: 1 1 auto;
    color: var(--category-color);
    font-size: 2rem;
    text-transform: uppercase;
  }

  .category-abreviation:last-of-type {
    transform: rotate(180deg);
  }
</style>

<script>
  export let category = "category";
  export let question = "question";
  export let example = "example";
  export let categoryAbbreviation = "cat";
</script>

<div class="card-front">
  <div class="category-abreviation">{categoryAbbreviation}</div>
  <p class="category">{category}</p>
  <h3 class="question">{question}</h3>
  {#if example}
    <p class="example">{example}</p>
  {/if}
  <div class="category-abreviation">{categoryAbbreviation}</div>
</div>
