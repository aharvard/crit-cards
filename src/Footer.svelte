<style>
  footer {
    background: #222;
    padding: 8rem 0;
    color: white;
    font-weight: 500;
    text-align: center;
  }

  a {
    text-decoration: none;
    color: white;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
  }

  a::before {
    position: absolute;
    bottom: -0.4em;
    content: "";
    height: 100%;
    width: 100%;
    background: var(--orange);
    z-index: -1;
    transform: scale(0.6, 0.2) translateY(0em);
    transform-origin: center bottom;
    transition: all 250ms;
  }

  a:focus::before,
  a:hover::before {
    transform: scale(1, 0.2) translateY(0em);
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    display: inline;
  }
  li + li {
    margin-left: 1rem;
  }
  li + li::before {
    content: "•";
    margin-right: 1rem;
  }
  p {
    margin: 0 0 2rem;
  }
</style>

<footer>
  <slot>
    <!-- optional fallback -->
  </slot>
  <p>
    Inspired by
    <a href="https://twitter.com/mhjallan" target="_blank">Mikey Allan</a>
    , creator of
    <a href="https://mikeyallan.com/work/critique-cards" target="_blank">
      Critique Cards.
    </a>
  </p>

  <ul>
    <li>
      Site by
      <a href="https://twitter.com/aharvard" target="_blank">Andrew Harvard</a>
    </li>
    <li>
      Built with
      <a href="https://svelte.dev/" target="_blank">Svelte</a>

    </li>

    <li>
      Hosted on
      <a href="https://www.netlify.com/" target="_blank">Netlify</a>
    </li>
    <li>
      Icons from
      <a href="https://streamlineicons.com/" target="_blank">Streamline 3.0</a>
    </li>
  </ul>
</footer>
