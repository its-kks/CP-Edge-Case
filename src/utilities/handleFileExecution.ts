import * as vscode from 'vscode';
import { spawn, ChildProcess } from 'child_process';
import pidusage from 'pidusage';
import { MAX_EXECUTION_TIME, MAX_MEMORY_USAGE, EXECUTION_COMMANDS } from '../constants';


export async function executeFiles(fileObject: { [key: string]: string | undefined }) {

    const extGen = fileObject["generator"]?.split('.').pop();
    const extCorr = fileObject["correct"]?.split('.').pop();
    const extIncorr = fileObject["incorrect"]?.split('.').pop();

    let generatorOutput: string = '';
    let correctOutput: string = ' ';
    let incorrectOutput: string = ' ';

    while (correctOutput === incorrectOutput) {
        if (fileObject["generator"] && extGen) {
            try {
                generatorOutput = await executeSingleFile(fileObject["generator"], extGen, '');
                if (fileObject["correct"] && extCorr && fileObject["incorrect"] && extIncorr) {

                    try {
                        correctOutput = await executeSingleFile(fileObject["correct"], extCorr, generatorOutput);
                        incorrectOutput = await executeSingleFile(fileObject["incorrect"], extIncorr, generatorOutput);
                    }
                    catch (error) {
                        throw error;
                    }

                }
            }
            catch (error) {
                vscode.window.showErrorMessage(`${error}`);
            }
        }
    }
    return [generatorOutput,correctOutput, incorrectOutput];
}

export function executeSingleFile(filename: string, extension: string, stdInput: string): Promise<string> {
    return new Promise((resolve, reject) => {
        let command = EXECUTION_COMMANDS[extension];
        if (command) {
            command = command.replace(/\$\{file\}/g, filename).replace(/\$\{fileBase\}/g, filename.split('.')[0]);
            const child = spawn(command, { shell: true });
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
                    resolve(stdout);
                } else {
                    reject(new Error(`${stderr}`));
                }
            });

            child.on('error', (err) => {
                reject(err);
            });
        } else {
            reject(`No execution command for .${extension} file`);
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