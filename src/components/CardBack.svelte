<style>
  .card-back {
    overflow: hidden;
    border-radius: var(--card-border-radius);
    padding: var(--card-padding);
    width: var(--card-width);
    height: var(--card-height);
    background: var(--black);
    color: white;
    background: url("media/card-back-texture.svg"), radial-gradient(#333, #111);
    background-size: 100%;
    display: flex;
  }
  .title {
    flex: 1 1 auto;
    text-transform: uppercase;
    font-size: 1.2rem;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.1em;
    line-height: 1.1;
  }
  .title:last-of-type {
    transform: rotate(180deg);
  }
</style>

<script>
  const cardTitle = "Critique Cards";
</script>

<div class="card-back" aria-hidden="true">
  <div class="title">{cardTitle}</div>
  <div class="title">{cardTitle}</div>
</div>
