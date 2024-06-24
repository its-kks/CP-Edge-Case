import * as vscode from 'vscode';
import { PATH_SEPARATOR } from "../constants";

// opens pop up window to select file and return path of selected file wrapped in promise
export async function selectFile() {
    const options: vscode.OpenDialogOptions = {
        canSelectMany: false,
        openLabel: 'Select File',
        filters: {
            'Code Files': ['cpp', 'c', 'cc', 'java', 'py']
        }
    };

    const fileUri = await vscode.window.showOpenDialog(options);

    if (fileUri && fileUri[0]) {
        vscode.window.showInformationMessage(`Selected file: ${fileUri[0].fsPath}`);
        return fileUri[0].fsPath;
    }
    else {
        vscode.window.showErrorMessage(`Failed to select file`);
        return undefined;
    }
}

// send message to add name ( update name ) of selected file in webview
export function updateFileName(webviewView: vscode.WebviewView, fileObject: { [key: string]: string | undefined }) {
    webviewView.webview.postMessage({
        command: 'updateFileName',
        fileObject: fileObject,
        PATH_SEPARATOR: PATH_SEPARATOR
    });

}

// send message to show the generated test case and output of correct and incorrect file
export function setOutput(webviewView: vscode.WebviewView, receivedOutput: string[] | undefined) {
    webviewView.webview.postMessage({
        command: 'updateOutputs',
        receivedOutput: receivedOutput
    });
}

export function enableStartButton(webviewView: vscode.WebviewView) {
    webviewView.webview.postMessage({
        command: 'enableStart'
    });
}

export function enableResetButton(webviewView: vscode.WebviewView) {
    webviewView.webview.postMessage({
        command: 'enableReset'
    });
}

export function disableStopButton(webviewResponse: vscode.WebviewView){
    webviewResponse.webview.postMessage({
        command: 'disableStop'
    });
}