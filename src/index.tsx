import { render } from "preact";
import { App } from "./App.js";
import "./newtab.css";

// Mount Preact app
const appContainer = document.getElementById("app");
if (appContainer) {
  render(<App />, appContainer);
}
