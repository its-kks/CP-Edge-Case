import * as vscode from "vscode";
import { getNonce } from "./utilities/getNonce";
import { selectFile, updateFileName, setOutput, enableStartButton, enableResetButton, disableStopButton } from "./utilities/webviewResponse";
import { executeFiles } from "./utilities/handleFileExecution";

export class SidebarProvider implements vscode.WebviewViewProvider {
    _view?: vscode.WebviewView;
    _doc?: vscode.TextDocument;
    _fileObject?: { [key: string]: string | undefined };
    _testcaseAndOutput?: string[];


    constructor(private readonly _extensionUri: vscode.Uri) {
        this._fileObject = {};
        this._fileObject["correct"] = undefined;
        this._fileObject["incorrect"] = undefined;
        this._fileObject["generator"] = undefined;
        this._fileObject["count"] = "1";
        this._fileObject["execute"] = "true";

    }

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,

            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);


        webviewView.onDidChangeVisibility( async (event) => {
            if (webviewView.visible) {
                updateFileName(webviewView, { ...this._fileObject });
                setOutput(webviewView, this._testcaseAndOutput);
            }
        });

        webviewView.webview.onDidReceiveMessage(async (data) => {
            // handle messages sent by webview and received by extension
            switch (data.command) {
                case 'correctFileSelect':
                    if (this._fileObject) {
                        this._fileObject["correct"] = await selectFile();
                        updateFileName(webviewView, { ...this._fileObject });
                    }
                    return;
                case 'incorrectFileSelect':
                    if (this._fileObject) {
                        this._fileObject["incorrect"] = await selectFile();
                        updateFileName(webviewView, { ...this._fileObject });
                    }
                    return;
                case 'generatorFileSelect':
                    if (this._fileObject) {
                        this._fileObject["generator"] = await selectFile();
                        updateFileName(webviewView, { ...this._fileObject });
                    }
                    return;
                case 'testCountChanged':
                    if (this._fileObject) {
                        this._fileObject["count"] = data.count;
                    }
                    return;
                case 'findTestCases':
                    if (this._fileObject && this._fileObject["correct"] &&
                        this._fileObject["incorrect"] && this._fileObject["generator"] &&
                        this._fileObject["execute"] && this._fileObject["count"]) {

                        this._fileObject["execute"] = "true";
                        this._testcaseAndOutput = await executeFiles(this._fileObject);
                        if (this._testcaseAndOutput[1] === this._testcaseAndOutput[2] || this._fileObject["execute"] === "false") {
                            this._testcaseAndOutput[0] = '';
                            this._testcaseAndOutput[1] = '';
                            this._testcaseAndOutput[2] = '';
                        }
                        else {
                            this._testcaseAndOutput[0] = this._fileObject["count"] + "\n" + this._testcaseAndOutput[0];
                        }
                        setOutput(webviewView, this._testcaseAndOutput);
                    }
                    else {
                        vscode.window.showWarningMessage("Select all files first");
                    }
                    if (this._fileObject && this._fileObject["execute"] === "false") {
                        vscode.window.showWarningMessage("Executing stopped");
                    }
                    disableStopButton(webviewView);
                    enableStartButton(webviewView);
                    enableResetButton(webviewView);
                    return;
                case 'stopExecution':
                    if (this._fileObject && this._fileObject["execute"]) {
                        this._fileObject["execute"] = "false";
                    }
                    vscode.window.showWarningMessage("Stopping execution");
                    return;
                case 'resetState':
                    if (this._fileObject) {
                        this._fileObject["correct"] = undefined;
                        this._fileObject["incorrect"] = undefined;
                        this._fileObject["generator"] = undefined;
                        this._fileObject["count"] = "1";
                        this._fileObject["execute"] = "true";
                    }
                    updateFileName(webviewView, { ...this._fileObject });
                    setOutput(webviewView, ['', '', '']);
                    return;
            }
        });
    }

    public revive(panel: vscode.WebviewView) {
        this._view = panel;
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const styleResetUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media/css", "reset.css")
        );
        const styleVSCodeUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media/css", "vscode.css")
        );
        const styleSidebarUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media/css", "sidebar.css")
        );

        const scriptUiUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "src/UI", "uiHandle.ts")
        );

        const gifUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media/gif", "Loading.gif")
        );

        // Use a nonce to only allow a specific script to be run.
        const nonce = getNonce();

        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
        -->
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
                <link href="${styleSidebarUri}" rel="stylesheet">
			</head>
      <body>
                <div class="main-div">
                    <div class="object-container">
                        <div class="head-div">
                            <h2> Edge Case Finder </h2>
                        </div>

                        <div class = "div-input">

                            <input placeholder="No file selected" disabled class="correct-file-input"/>
                            <button class="slect-correct-file">Select Correct Code File</button>

                            <input placeholder="No file selected" disabled class="incorrect-file-input"/>
                            <button class="select-wrong-file">Select Incorrect Code File</button>

                            <input placeholder="No file selected" disabled class="generator-file-input"/>
                            <button class="select-generator-file">Select Test Generator File</button>

                            <div class="div-test-case">
                                <label for="testCaseCount">Select number of test cases:</label>
                                <select id="testCaseCount" name="testCaseCount">
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                </select>
                            </div>

                        </div>

                        
                        <div class="result-div">
                            
                            <label for="testCase">Test Case:</label>
                            <textarea class="test-case" id="testCase"></textarea>

                            <label for="correctOutput">Correct Output:</label>
                            <textarea class="correct-output" id="correctOutput"></textarea>

                            <label for="incorrectOutput">Incorrect Output:</label>
                            <textarea class="incorrect-output" id="incorrectOutput"></textarea>
                        </div>
                        
                    </div>
                    <div class="start-stop-div">
                        <button class='start'>
                            <div class="start-button-div">
                                Run
                            </div>
                            <img src=${gifUri} class="start-button-img" style="display:none;">
                        </button>
                        <button class='stop' disabled>Stop</button>
                        <button class='reset'>Reset</button>
                    </div>
                </div>
                <script nonce=${nonce}>
                    const webVscode = acquireVsCodeApi();
                </script>
                <script nonce=${nonce}>
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
                </script>


			</body>
			</html>`;
    }
}