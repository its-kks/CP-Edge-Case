let correctFileSelectButton = document.querySelector(".slect-correct-file");
let incorrectFileSelectButton = document.querySelector(".select-wrong-file");
let generatorFileSelectButton = document.querySelector(".select-generator-file");
let selectTestCaseCount = document.getElementById('testCaseCount');
let startButton = document.querySelector(".start");
let stopButton = document.querySelector(".stop");
let resetButton = document.querySelector(".reset");
let startDiv = document.querySelector(".start-button-div");
let startImg = document.querySelector(".start-button-img");
let autoGenerateButton = document.querySelector(".generate-generator-file");
let loaderAutoGenerate = document.querySelector(".loader-image-auto-generate");
let textAutoGenerate = document.querySelector(".text-auto-generate");
let testCaseType = document.querySelector(".test-case-type");


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

// Auto generate generator file button event listener
autoGenerateButton.addEventListener("click",()=>{
    loaderAutoGenerate.style.display = 'inline';
    textAutoGenerate.style.display = 'none';

    webVscode.postMessage({
        command: 'autoGenerateGeneratorFile',
    })
})


// event listener for option list
selectTestCaseCount?.addEventListener("change", (event) => {
    // @ts-ignore
    webVscode.postMessage({
        command: 'testCountChanged',
        // @ts-ignore
        count: (event.target)?.value,
    });
});


function addOption(select, value, text) {
    let option = document.createElement("option");
    option.value = value;
    option.text = text;
    select.appendChild(option);
}

function removeOptionExcept(select) {
    while(select.options.length != 1){
        select.remove(1);
    }
}

// event listener option list test case type
testCaseType.addEventListener("change",(event)=>{
    if(event.target.value==="true"){
        if(selectTestCaseCount.options.length!=5){
            addOption(selectTestCaseCount,'2','2');
            addOption(selectTestCaseCount,'3','3');
            addOption(selectTestCaseCount,'4','4');
            addOption(selectTestCaseCount,'5','5');
        }
    }
    else{
        if(selectTestCaseCount.options.length!=1){
            removeOptionExcept(selectTestCaseCount);
        }
    }
    webVscode.postMessage({
        command:'testCaseTypeChanged',
        hasTestCaseCount: event.target.value
    })
})


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