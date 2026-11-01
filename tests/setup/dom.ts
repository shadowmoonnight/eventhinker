import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost:3000",
  pretendToBeVisual: true,
});

const { window } = dom;

const defineGlobal = (name: string, value: unknown): void => {
  Object.defineProperty(globalThis, name, {
    value,
    configurable: true,
    writable: true,
  });
};

defineGlobal("window", window);
defineGlobal("document", window.document);
defineGlobal("navigator", window.navigator);
defineGlobal("HTMLElement", window.HTMLElement);
defineGlobal("Element", window.Element);
defineGlobal("Node", window.Node);
defineGlobal("Event", window.Event);
defineGlobal("CustomEvent", window.CustomEvent);
defineGlobal("KeyboardEvent", window.KeyboardEvent);
defineGlobal("MouseEvent", window.MouseEvent);
defineGlobal("localStorage", window.localStorage);
defineGlobal(
  "requestAnimationFrame",
  (cb: FrameRequestCallback): number => setTimeout(cb, 16) as unknown as number,
);
defineGlobal("cancelAnimationFrame", (id: number): void => clearTimeout(id));
