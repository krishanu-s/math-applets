// A simple button
export function Button(
  container: HTMLElement,
  callback: () => void,
): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.id = "interactiveButton";
  button.style.padding = "15px";
  container.appendChild(button);
  button.addEventListener("click", (event: MouseEvent) => {
    callback();
    // Visual feedback
    button.style.transform = "scale(0.95)";
    setTimeout(() => {
      button.style.transform = "scale(1)";
    }, 100);
  });
  return button;
}
