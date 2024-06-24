const correctFileSelectButton = document.querySelector(".slect-correct-file");
const incorrectFileSelectButton = document.querySelector(".select-wrong-file");
const generatorFileSelectButton = document.querySelector(".select-generator-file");
const selectElement = document.getElementById('testCaseCount');
const startButton = document.querySelector(".start");
const stopButton = document.querySelector(".stop");


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


// event listener for option list
selectElement?.addEventListener("change", (event) => {
    webVscode.postMessage({
        command: 'testCountChanged',
        count: event.target?.value,
    });
});

// event listener for start button
startButton?.addEventListener("click", (event) => {
    webVscode.postMessage({
        command: 'findTestCases'
    });
    if (stopButton) {
        stopButton.disabled = false;
        startButton.disabled = true;
    }
});


stopButton?.addEventListener("click", (event) => {
    webVscode.postMessage({
        command: 'stopExecution'
    });
    stopButton.disabled = true;
});

window.addEventListener('message', (event) => {

    const message = event.data;

    switch (message.command) {
        case 'updateFileName':
            let correctFileInput = document.querySelector(".correct-file-input");
            if (correctFileInput && message.fileObject["correct"]) {
                correctFileInput.value = message.fileObject["correct"].split('/').pop();
            }
            let incorrectFileInput = document.querySelector(".incorrect-file-input");
            if (incorrectFileInput && message.fileObject["incorrect"]) {
                incorrectFileInput.value = message.fileObject["incorrect"].split('/').pop();
            }
            let generatorFileInput = document.querySelector(".generator-file-input");
            if (generatorFileInput && message.fileObject["generator"]) {
                generatorFileInput.value = message.fileObject["generator"].split('/').pop();
            }
        case 'updateOutputs':
            let testCaseTextArea = document.querySelector(".test-case");
            let correctOutputTextArea = document.querySelector(".correct-output");
            let incorrectOutputTextArea = document.querySelector(".incorrect-output");
            if (testCaseTextArea && correctOutputTextArea && incorrectOutputTextArea) {
                testCaseTextArea.value = message.receivedOutput[0];
                correctOutputTextArea.value = message.receivedOutput[1];
                incorrectOutputTextArea.value = message.receivedOutput[2];
            }
        case 'enableStart':
            if (startButton) {
                startButton.disabled = false;
            }

    }
});