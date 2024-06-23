import * as vscode from 'vscode';
import { spawn, ChildProcess } from 'child_process';
import pidusage from 'pidusage';
import { MAX_EXECUTION_TIME, MAX_MEMORY_USAGE, EXECUTION_COMMANDS } from '../constants';


export async function executeFiles(fileObject: { [key: string]: string | undefined }) {

    const extGen = fileObject["generator"]?.split('.').pop();

    let generatorArr : string[] | undefined;
    let correctArr : string[] | undefined;
    let incorrectArr : string[] | undefined;

    if (fileObject["generator"] && extGen) {
        generatorArr = await executeSingleFile(fileObject["generator"], extGen, '');
    }
    if(generatorArr){
        
        if( generatorArr[0].length === 0 && generatorArr[1].length === 0){
            vscode.window.showErrorMessage("Failed to execute generator file");
        }
        else if(generatorArr[1].length === 0){
            vscode.window.showWarningMessage(`OUTPUT ${generatorArr[0]}`);
        }
        else{
            vscode.window.showErrorMessage(`Error in generator file ${generatorArr[1]}`);
        }
    }


}

export function executeSingleFile(filename: string, extension: string, stdInput: string): Promise<[string, string]> {
    return new Promise((resolve, reject) => {
        let command = EXECUTION_COMMANDS[extension];
        if (command) {
            command = command.replace(/\$\{file\}/g, filename).replace(/\$\{fileBase\}/g, filename.split('.')[0]);
            const child = spawn(command,  { shell: true });
            child.stdin.write(stdInput);
            child.stdin.end();

            let stdout: string = '';
            let stderr: string = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve([stdout, stderr]);
                } else {
                    reject(new Error(`child process exited with code ${code}`));
                }
            });

            child.on('error', (err) => {
                reject(err);
            });
        } else {
            vscode.window.showErrorMessage(`No execution command for .${extension} file`);
            resolve(['', '']);
        }
    });
}


/*

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.runPythonFile', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const filePath = vscode.workspace.asRelativePath(document.uri);

            if (document.languageId === "python") {
                const input = await vscode.window.showInputBox({
                    prompt: "Enter input for the Python script",
                    placeHolder: "Input here"
                });

                if (input === undefined) {
                    return; // User cancelled the input
                }

                const python = spawn('python', [filePath]);

                python.stdin.write(input);
                python.stdin.end();

                let output = '';
                python.stdout.on('data', (data) => {
                    output += data.toString();
                });

                python.stderr.on('data', (data) => {
                    vscode.window.showErrorMessage(`Error: ${data}`);
                });

                monitorProcess(python);

                python.on('close', (code) => {
                    if (code === 0) {
                        vscode.workspace.openTextDocument({
                            content: output,
                            language: 'text'
                        }).then(doc => {
                            vscode.window.showTextDocument(doc, { preview: false });
                        });
                    } else {
                        vscode.window.showErrorMessage(`Python script exited with code ${code}`);
                    }
                });
            } else {
                vscode.window.showErrorMessage('Not a Python file');
            }
        }
    });

    context.subscriptions.push(disposable);
}

function monitorProcess(process: ChildProcess) {
    const startTime = Date.now();

    const interval = setInterval(() => {
        if (process.pid) {
            pidusage(process.pid, (err, stats) => {
                if (err) {
                    clearInterval(interval);
                    return;
                }

                const executionTime = Date.now() - startTime;

                if (stats.memory > MAX_MEMORY_USAGE) {
                    terminateProcess(process, interval, 'Memory usage exceeded limit');
                } else if (executionTime > MAX_EXECUTION_TIME) {
                    terminateProcess(process, interval, 'Execution time exceeded limit');
                }
            });
        } else {
            clearInterval(interval);
        }
    }, 1000); // Check every second
}

function terminateProcess(process: ChildProcess, interval: NodeJS.Timeout, reason: string) {
    clearInterval(interval);
    process.kill();
    vscode.window.showErrorMessage(`Process terminated: ${reason}`);
}

*/