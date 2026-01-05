const canvas = document.getElementById("maincanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const context = canvas.getContext("2d");
let counter = 10;
const updateState = () => {
    counter++;
    if (counter > 200) {
        counter = 10;
    }
    renderState();
    window.requestAnimationFrame(() => updateState());
};
const renderState = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#333333";
    context.fillRect(counter, counter, canvas.width - 2 * counter, canvas.height - 2 * counter);
};
window.requestAnimationFrame(() => updateState());
export {};
//# sourceMappingURL=app.js.map