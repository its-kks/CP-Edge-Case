let correctFileSelectButton = document.querySelector(".slect-correct-file");
let incorrectFileSelectButton = document.querySelector(".select-wrong-file");
let generatorFileSelectButton = document.querySelector(".select-generator-file");
let selectElement = document.getElementById('testCaseCount');
let startButton = document.querySelector(".start");
let stopButton = document.querySelector(".stop");
let resetButton = document.querySelector(".reset");
let startDiv = document.querySelector(".start-button-div");
let startImg = document.querySelector(".start-button-img");


// Correct file select button event listener
correctFileSelectButton?.addEventListener("click", () => {
    // @ts-ignore
    webVscode.postMessage({
        command: 'correctFileSelect',
    });
});

// Incorrect file select button event listener
incorrectFileSelectButton?.addEventListener("click", () => {
    // @ts-ignore
    webVscode.postMessage({
        command: 'incorrectFileSelect',
    });
});

// Generator file select button event listener
generatorFileSelectButton?.addEventListener("click", () => {
    // @ts-ignore
    webVscode.postMessage({
        command: 'generatorFileSelect',
    });
});


// event listener for option list
selectElement?.addEventListener("change", (event) => {
    // @ts-ignore
    webVscode.postMessage({
        command: 'testCountChanged',
        // @ts-ignore
        count: (event.target)?.value,
    });
});

// event listener for start button
startButton?.addEventListener("click", (event) => {
    // @ts-ignore
    webVscode.postMessage({
        command: 'findTestCases'
    });
    if (stopButton && resetButton && startDiv && startImg) {
        // @ts-ignore
        startDiv.style.display = 'none';
        // @ts-ignore
        startImg.style.display = 'inline';
        // @ts-ignore
        stopButton.disabled = false;
        // @ts-ignore
        startButton.disabled = true;
        // @ts-ignore
        resetButton.disabled = true;
    }
});


stopButton?.addEventListener("click", (event) => {
    // @ts-ignore
    webVscode.postMessage({
        command: 'stopExecution'
    });
    // @ts-ignore
    stopButton.disabled = true;
});

resetButton?.addEventListener("click", (event) => {
    // @ts-ignore
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
                    // @ts-ignore
                    correctFileInput.value = message.fileObject["correct"].split(message.PATH_SEPARATOR).pop();
                }
                else {
                    // @ts-ignore
                    correctFileInput.value = '';
                }
            }
            let incorrectFileInput = document.querySelector(".incorrect-file-input");
            if (incorrectFileInput) {
                if (message.fileObject["incorrect"]) {
                    // @ts-ignore
                    incorrectFileInput.value = message.fileObject["incorrect"].split(message.PATH_SEPARATOR).pop();
                } else {
                    // @ts-ignore
                    incorrectFileInput.value = '';
                }
            }
            let generatorFileInput = document.querySelector(".generator-file-input");
            if (generatorFileInput) {
                if (message.fileObject["generator"]) {
                    // @ts-ignore
                    generatorFileInput.value = message.fileObject["generator"].split(message.PATH_SEPARATOR).pop();
                } else {
                    // @ts-ignore
                    generatorFileInput.value = '';
                }
            }
            return;
        case 'updateOutputs':
            let testCaseTextArea = document.querySelector(".test-case");
            let correctOutputTextArea = document.querySelector(".correct-output");
            let incorrectOutputTextArea = document.querySelector(".incorrect-output");
            if (testCaseTextArea && correctOutputTextArea && incorrectOutputTextArea) {
                // @ts-ignore
                testCaseTextArea.value = message.receivedOutput[0];
                // @ts-ignore
                correctOutputTextArea.value = message.receivedOutput[1];
                // @ts-ignore
                incorrectOutputTextArea.value = message.receivedOutput[2];
            }
            return;
        case 'enableStart':
            if (startButton && startDiv && startImg) {
                // @ts-ignore
                startButton.disabled = false;
                // @ts-ignore
                startDiv.style.display = 'block';
                // @ts-ignore
                startImg.style.display = 'none';
            }
            return;
        case 'enableReset':
            if (resetButton) {
                // @ts-ignore
                resetButton.disabled = false;
            }
            return;
        case 'disableStop':
            if (stopButton){
                // @ts-ignore
                stopButton.disabled = true;
            }
            return;
    }
});