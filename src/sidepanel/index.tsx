import { render } from "preact";
import { SidePanelApp } from "./SidePanelApp.js";
import "../sidepanel.css";

const appRoot = document.getElementById("app");
if (appRoot) {
  render(<SidePanelApp />, appRoot);
}
