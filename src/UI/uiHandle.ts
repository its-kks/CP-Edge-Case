

const correctFileSelectButton : HTMLButtonElement | null= document.querySelector(".slect-correct-file");
const incorrectFileSelectButton : HTMLButtonElement | null= document.querySelector(".select-wrong-file");
const generatorFileSelectButton : HTMLButtonElement | null= document.querySelector(".select-generator-file");
const selectElement : HTMLElement | null = document.getElementById('testCaseCount');
const startButton : HTMLButtonElement | null= document.querySelector(".start");
const stopButton : HTMLButtonElement | null= document.querySelector(".stop");
const resetButton : HTMLButtonElement | null= document.querySelector(".reset");
const startDiv : HTMLDivElement | null = document.querySelector(".start-button-div");
const startImg : HTMLImageElement | null= document.querySelector(".start-button-img");


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
        count: (event.target as HTMLInputElement)?.value,
    });
});

// event listener for start button
startButton?.addEventListener("click", (event) => {
    // @ts-ignore
    webVscode.postMessage({
        command: 'findTestCases'
    });
    if (stopButton && resetButton && startDiv && startImg) {
        startDiv.style.display = 'none';
        startImg.style.display = 'inline';
        stopButton.disabled = false;
        startButton.disabled = true;
        resetButton.disabled = true;
    }
});


stopButton?.addEventListener("click", (event) => {
    // @ts-ignore
    webVscode.postMessage({
        command: 'stopExecution'
    });
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
            let correctFileInput : HTMLInputElement | null = document.querySelector(".correct-file-input");
            if (correctFileInput) {
                if (message.fileObject["correct"]) {
                    correctFileInput.value = message.fileObject["correct"].split(message.PATH_SEPARATOR).pop();
                }
                else {
                    correctFileInput.value = '';
                }
            }
            let incorrectFileInput : HTMLInputElement | null= document.querySelector(".incorrect-file-input");
            if (incorrectFileInput) {
                if (message.fileObject["incorrect"]) {
                    incorrectFileInput.value = message.fileObject["incorrect"].split(message.PATH_SEPARATOR).pop();
                } else {
                    incorrectFileInput.value = '';
                }
            }
            let generatorFileInput : HTMLInputElement | null= document.querySelector(".generator-file-input");
            if (generatorFileInput) {
                if (message.fileObject["generator"]) {
                    generatorFileInput.value = message.fileObject["generator"].split(message.PATH_SEPARATOR).pop();
                } else {
                    generatorFileInput.value = '';
                }
            }
            return;
        case 'updateOutputs':
            let testCaseTextArea :HTMLTextAreaElement | null = document.querySelector(".test-case");
            let correctOutputTextArea :HTMLTextAreaElement | null= document.querySelector(".correct-output");
            let incorrectOutputTextArea :HTMLTextAreaElement | null= document.querySelector(".incorrect-output");
            if (testCaseTextArea && correctOutputTextArea && incorrectOutputTextArea) {
                testCaseTextArea.value = message.receivedOutput[0];
                correctOutputTextArea.value = message.receivedOutput[1];
                incorrectOutputTextArea.value = message.receivedOutput[2];
            }
            return;
        case 'enableStart':
            if (startButton && startDiv && startImg) {
                startButton.disabled = false;
                startDiv.style.display = 'block';
                startImg.style.display = 'none';
            }
            return;
        case 'enableReset':
            if (resetButton) {
                resetButton.disabled = false;
            }
            return;
        case 'disableStop':
            if (stopButton){
                stopButton.disabled = true;
            }
            return;
    }
});