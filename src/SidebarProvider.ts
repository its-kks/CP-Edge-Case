import * as vscode from "vscode";
import { getNonce } from "./utilities/getNonce";
import { selectFile, updateFileName, setOutput, enableStartButton, enableResetButton, disableStopButton,
    autoGenerateTestCaseGeneratorCompleted
 } from "./utilities/webviewResponse";
import { executeFiles } from "./utilities/handleFileExecution";
import handleAutoGenerate from "./utilities/handleAutoGenerateGeneratorFile";
import { AUTO_GENERATED_FILE_TYPE, FILE_NAME, PROMPT_COUNT_ABSENT, PROMPT_COUNT_PRESENT } from "./constants";
import makeLLMRequestAndFileAdd from "./utilities/makeLLMRequestAndFileAdd";


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
        this._fileObject["hasTestCaseCount"] = "true";

    }

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,

            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);


        webviewView.onDidChangeVisibility(async (event) => {
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
                case 'testCaseTypeChanged':
                    if (this._fileObject) {
                        this._fileObject["count"] = "1";
                        this._fileObject["hasTestCaseCount"] = data.hasTestCaseCount;
                    }
                    return;
                case 'autoGenerateGeneratorFile':
                    vscode.window.showInformationMessage("Click Competetive Companion extension button in browser");
                    if (this._fileObject) {
                        const pyPathUrlInp = vscode.Uri.joinPath(this._extensionUri, "media/python", "fetchInputsUrl.py").path;
                        const pyPathInpDes = vscode.Uri.joinPath(this._extensionUri, "media/python", "fetchInputDes.py").path;
                        const inputsAndURL = await handleAutoGenerate(pyPathUrlInp, pyPathInpDes);
                        if (vscode.workspace.workspaceFolders) {
                            const folderPath: string | undefined = vscode.workspace.workspaceFolders[0].uri.fsPath;
                            if (inputsAndURL.input && inputsAndURL.inputDescription && inputsAndURL.url) {
                                let prompt = this._fileObject.hasTestCaseCount == "true" ? PROMPT_COUNT_PRESENT : PROMPT_COUNT_ABSENT;
                                let language: string = 'python';
                                if (AUTO_GENERATED_FILE_TYPE) {
                                    language = AUTO_GENERATED_FILE_TYPE;
                                }
                                
                                prompt = prompt.replace(/\{language\}/g, language);
                                prompt = prompt.replace(/\{desc\}/g, inputsAndURL.inputDescription);
                                prompt = prompt.replace(/\{testcase\}/g, inputsAndURL.input);

                                
                                // making request to LLM
                                try {
                                    await makeLLMRequestAndFileAdd(prompt,folderPath,FILE_NAME[language],language);
                                }
                                catch(error){
                                    vscode.window.showErrorMessage('Copilot Failed');
                                }
                                this._fileObject["generator"] = folderPath+"/"+FILE_NAME[language];
                                updateFileName(webviewView, { ...this._fileObject });
                            }
                        }
                        else{
                            vscode.window.showWarningMessage('Opening some directory in VS Code first');
                        }
                        autoGenerateTestCaseGeneratorCompleted(webviewView);
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
                        else if (this._fileObject["hasTestCaseCount"] == "true") {
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
            vscode.Uri.joinPath(this._extensionUri, "media/js", "uiHandle.js")
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
                            <button class="slect-correct-file">Select Correct Code File (Brute Force)</button>

                            <input placeholder="No file selected" disabled class="incorrect-file-input"/>
                            <button class="select-wrong-file">Select Incorrect Code File (Optimized)</button>

                            <input placeholder="No file selected" disabled class="generator-file-input"/>
                            <div class= 'generator-button-div'>
                                <button class="select-generator-file">Select Test Case Generator File</button>
                                <button class="generate-generator-file">
                                    <span class="text-auto-generate">
                                        Auto Generate Test Case Generator File
                                    </span>
                                    <img src=${gifUri} class="loader-image-auto-generate" style="display:none;">
                                </button>
                            </div>

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
                            <div class="div-type-test-case">
                                <label for="testCaseType">Select test case type:</label>
                                <select class="test-case-type" name="testCaseType">
                                    <option value="true">Has test case count</option>
                                    <option value="false">Don't have test case count</option>
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
                <script nonce=${nonce} src=${scriptUiUri}>
                </script>


			</body>
			</html>`;
    }
}