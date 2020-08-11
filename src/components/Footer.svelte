<style>
  footer {
    min-height: 10rem;
    text-align: center;
    color: white;
    padding: 2rem;
  }
</style>

<script>
  import Link from "./Link.svelte";
</script>

<footer>
  <p>
    Site by
    <Link text="Andrew Harvard" />
  </p>
  <p>
    Critique Cards by
    <Link text="Mikey Allan" />
  </p>
  <p>
    Built with
    <Link text="Svelte" />
    Hosted on
    <Link text="Netlify" />
  </p>
  <p>
    Icons from
    <Link text="Streamline 3.0" />
  </p>
</footer>
