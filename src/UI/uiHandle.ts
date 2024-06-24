const correctFileSelectButton = document.querySelector(".slect-correct-file");
const incorrectFileSelectButton = document.querySelector(".select-wrong-file");
const generatorFileSelectButton = document.querySelector(".select-generator-file");
const selectElement = document.getElementById('testCaseCount');
const startButton = document.querySelector(".start");
const stopButton = document.querySelector(".stop");
const resetButton = document.querySelector(".reset");


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
    if (stopButton && resetButton) {
        stopButton.disabled = false;
        startButton.disabled = true;
        resetButton.disabled = true;
    }
});


stopButton?.addEventListener("click", (event) => {
    webVscode.postMessage({
        command: 'stopExecution'
    });
    stopButton.disabled = true;
});

resetButton?.addEventListener("click", (event) => {
    webVscode.postMessage({
        command: 'resetState'
    });
});

window.addEventListener('message', (event) => {

    const message = event.data;

    switch (message.command) {
        case 'updateFileName':
            let correctFileInput = document.querySelector(".correct-file-input");
            if (correctFileInput) {
                if (message.fileObject["correct"]) {
                    correctFileInput.value = message.fileObject["correct"].split(message.PATH_SEPARATOR).pop();
                }
                else {
                    correctFileInput.value = '';
                }
            }
            let incorrectFileInput = document.querySelector(".incorrect-file-input");
            if (incorrectFileInput) {
                if (message.fileObject["incorrect"]) {
                    incorrectFileInput.value = message.fileObject["incorrect"].split(message.PATH_SEPARATOR).pop();
                } else {
                    incorrectFileInput.value = '';
                }
            }
            let generatorFileInput = document.querySelector(".generator-file-input");
            if (generatorFileInput) {
                if (message.fileObject["generator"]) {
                    generatorFileInput.value = message.fileObject["generator"].split(message.PATH_SEPARATOR).pop();
                } else {
                    generatorFileInput.value = '';
                }
            }
            return;
        case 'updateOutputs':
            let testCaseTextArea = document.querySelector(".test-case");
            let correctOutputTextArea = document.querySelector(".correct-output");
            let incorrectOutputTextArea = document.querySelector(".incorrect-output");
            if (testCaseTextArea && correctOutputTextArea && incorrectOutputTextArea) {
                testCaseTextArea.value = message.receivedOutput[0];
                correctOutputTextArea.value = message.receivedOutput[1];
                incorrectOutputTextArea.value = message.receivedOutput[2];
            }
            return;
        case 'enableStart':
            if (startButton) {
                startButton.disabled = false;
            }
            return;
        case 'enableReset':
            if (resetButton) {
                resetButton.disabled = false;
            }
            return;

    }
});