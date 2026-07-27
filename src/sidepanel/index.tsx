import { render } from "preact";
import { SidePanelApp } from "./SidePanelApp.js";

const appRoot = document.getElementById("app");
if (appRoot) {
  render(<SidePanelApp />, appRoot);
}
