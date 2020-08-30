import App from "../src/App.svelte";

export default {
  title: "App",
  parameters: {
    layout: "fullscreen",
  },
};

export const app = () => ({
  Component: App,
});
