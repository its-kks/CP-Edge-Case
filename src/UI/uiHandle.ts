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



window.addEventListener('message', (event) => {

    const message = event.data;

    switch (message.command) {
        case 'updateFileName':
            let correctFileInput = document.querySelector(".correct-file-input");
            if(correctFileInput && message.fileObject["correct"]){
                correctFileInput.value = message.fileObject["correct"].split('/').pop();
            }
            let incorrectFileInput = document.querySelector(".incorrect-file-input");
            if(incorrectFileInput && message.fileObject["incorrect"]){
                incorrectFileInput.value = message.fileObject["incorrect"].split('/').pop();
            }
            let generatorFileInput = document.querySelector(".generator-file-input");
            if(generatorFileInput && message.fileObject["generator"]){
                generatorFileInput.value = message.fileObject["generator"].split('/').pop();
            }

    }
});