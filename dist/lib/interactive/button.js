// A simple button
export function Button(container, callback) {
    const button = document.createElement("button");
    button.type = "button";
    button.id = "interactiveButton";
    button.style.padding = "15px";
    container.appendChild(button);
    button.addEventListener("click", (event) => {
        callback();
        // Visual feedback
        button.style.transform = "scale(0.95)";
        setTimeout(() => {
            button.style.transform = "scale(1)";
        }, 100);
    });
    return button;
}
//# sourceMappingURL=button.js.map