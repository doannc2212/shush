import { mount } from "svelte";
import App from "./App.svelte";
import "./app.css";

const root = document.getElementById("root");
if (!root) throw new Error("#root element not found");
mount(App, { target: root });
