<style>
  .card-back {
    overflow: hidden;
    border-radius: var(--card-border-radius);
    padding: var(--card-padding);
    width: var(--card-width);
    height: var(--card-height);
    background: var(--black);
    color: white;

    background: url("/card-back-texture.svg"), radial-gradient(#222, #111);
    background-size: 100%;
  }
  .title {
    user-select: none;
  }
</style>

<script>
  const cardTitle = "Critique Cards";
</script>

<div class="card-back" aria-hidden="true">
  <div class="title">{cardTitle}</div>
  <div class="title">{cardTitle}</div>
</div>
