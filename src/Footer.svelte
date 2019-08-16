<style>
  footer {
    padding: 2rem 0;
    color: white;
    font-weight: 400;
    letter-spacing: 0.1ch;
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
    background: var(--link-underline);
    z-index: -1;
    transform: scale(0.6, 0.1) translateY(0em);
    transform-origin: center bottom;
    transition: all 250ms cubic-bezier(0.19, 1, 0.22, 1);
  }

  a:focus::before,
  a:hover::before {
    transform: scale(1.1, 0.4) translateY(-1ex);
    opacity: 0.5;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    display: inline-block;
    margin-bottom: 2rem;
  }

  li + li {
    margin-left: 1rem;
  }
  li + li::before {
    content: "•";
    margin-right: 1rem;
  }
  @media (max-width: 50rem) {
    li {
      display: block;
    }
    li + li {
      margin-left: 0;
    }
    li + li::before {
      content: "";
      margin-right: 0;
    }
  }
  p {
    margin: 0 0 2rem;
  }
</style>

<footer>
  <ul>
    <li>
      Site by
      <a
        href="https://twitter.com/aharvard"
        target="_blank"
        style="--link-underline: var(--teal);">
        Andrew Harvard
      </a>
    </li>
    <li>

      <a
        href="https://mikeyallan.com/work/critique-cards"
        target="_blank"
        style="--link-underline: var(--orange);">
        Critique Cards
      </a>
      by
      <a
        href="https://twitter.com/mhjallan"
        target="_blank"
        style="--link-underline: var(--pink);">
        Mikey Allan
      </a>
    </li>
  </ul>

  <ul>
    <li>
      Built with
      <a
        href="https://svelte.dev/"
        target="_blank"
        style="--link-underline: var(--gold);">
        Svelte
      </a>

    </li>

    <li>
      Hosted on
      <a
        href="https://www.netlify.com/"
        target="_blank"
        style="--link-underline: var(--gray);">
        Netlify
      </a>
    </li>
    <li>
      Icons from
      <a
        href="https://streamlineicons.com/"
        target="_blank"
        style="--link-underline: var(--purple);">
        Streamline 3.0
      </a>
    </li>
  </ul>
</footer>
