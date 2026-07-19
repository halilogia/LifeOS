import { render } from "preact";
import { App } from "./App.js";
import { RepositoryProvider } from "./infrastructure/di/RepositoryContext.js";
import "./newtab.css";

// Mount Preact app
const appContainer = document.getElementById("app");
if (appContainer) {
  render(
    <RepositoryProvider>
      <App />
    </RepositoryProvider>,
    appContainer,
  );
}
