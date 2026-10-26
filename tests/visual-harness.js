"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const root = path.resolve(__dirname, "..");

function element() {
  const listeners = {};
  return {
    innerHTML: "", textContent: "", value: "All", hidden: false, disabled: false, checked: false,
    dataset: {}, listeners,
    addEventListener(name, callback) { listeners[name] = callback; },
    replaceChildren(...children) { this.children = children; this.textContent = children.map(child => child.textContent || "").join(""); },
    append(...children) { this.children = (this.children || []).concat(children); },
    appendChild(child) { this.children = (this.children || []).concat(child); return child; },
    scrollIntoView() {},
    classList: { toggle() {} },
    setAttribute() {},
    matches() { return false; }
  };
}

async function loadVisual() {
  const elements = new Map();
  const getElement = key => {
    if (!elements.has(key)) elements.set(key, element());
    return elements.get(key);
  };
  const context = vm.createContext({
    console,
    Math,
    Date,
    Promise,
    URLSearchParams,
    setInterval,
    clearInterval,
    setTimeout,
    localStorage: { getItem() { return "{}"; }, setItem() {} },
    document: {
      body: Object.assign(element(), { classList: { toggle() {} } }),
      querySelector: getElement,
      querySelectorAll() { return []; },
      createElement() { return Object.assign(element(), { src: "", onload: null, onerror: null, className: "" }); },
      createTextNode(text) { return Object.assign(element(), { textContent: String(text) }); },
      head: {
        appendChild(script) {
          try {
            const filename = path.resolve(root, script.src);
            vm.runInContext(fs.readFileSync(filename, "utf8"), context, { filename });
            if (script.onload) script.onload();
          } catch (error) {
            if (script.onerror) script.onerror(error);
            else throw error;
          }
        }
      }
    }
  });
  context.window = context;
  for (const file of ["svg.js", "rng.js", "checker.js", "click.js", "index.js"]) {
    const filename = path.join(root, "js/visual", file);
    vm.runInContext(fs.readFileSync(filename, "utf8"), context, { filename });
  }
  const enginePath = path.join(root, "js/visual/engine.js");
  vm.runInContext(fs.readFileSync(enginePath, "utf8"), context, { filename: enginePath });
  const deadline = Date.now() + 5000;
  while (!context.VISUAL_READY && Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  if (!context.VISUAL_READY) throw new Error("Visual generators did not load.");
  return context;
}

module.exports = { loadVisual, root };
