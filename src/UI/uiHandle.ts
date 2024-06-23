const correctFileSelectButton = document.querySelector(".slect-correct-file");
const incorrectFileSelectButton = document.querySelector(".select-wrong-file");
const generatorFileSelectButton = document.querySelector(".select-generator-file");


// Correct file select button event listener
correctFileSelectButton?.addEventListener("click", () => {
    webVscode.postMessage({
        command: 'correctFileSelect',
    });
});

// Incorrect file select button event listener
incorrectFileSelectButton?.addEventListener("click", () => {
    webVscode.postMessage({
        command: 'incorrectFileSelect',
    });
});

// Generator file select button event listener
generatorFileSelectButton?.addEventListener("click", () => {
    webVscode.postMessage({
        command: 'generatorFileSelect',
    });
});
