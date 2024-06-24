import * as vscode from 'vscode';
import { spawn, ChildProcess } from 'child_process';
import pidusage from 'pidusage';
import { MAX_EXECUTION_TIME, MAX_MEMORY_USAGE, EXECUTION_COMMANDS } from '../constants';


export async function executeFiles(fileObject: { [key: string]: string | undefined }): Promise<string[]> {
    const extGen = fileObject["generator"]?.split('.').pop();
    const extCorr = fileObject["correct"]?.split('.').pop();
    const extIncorr = fileObject["incorrect"]?.split('.').pop();

    let generatorOutput: string = '';
    let correctOutput: string = ' ';
    let incorrectOutput: string = ' ';

    while (correctOutput === incorrectOutput && fileObject["execute"] === "true") {
        if (fileObject["generator"] && extGen) {
            try {
                generatorOutput = await executeSingleFile(fileObject["generator"], extGen, '');
                if (fileObject["correct"] && extCorr && fileObject["execute"] === "true") {
                    correctOutput = await executeSingleFile(fileObject["correct"], extCorr, generatorOutput);
                }
                if (fileObject["incorrect"] && extIncorr && fileObject["execute"] === "true") {
                    incorrectOutput = await executeSingleFile(fileObject["incorrect"], extIncorr, generatorOutput);
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Error executing file: ${error}`);
                return [generatorOutput, correctOutput, incorrectOutput];
            }
        }
    }
    return [generatorOutput, correctOutput, incorrectOutput];
}

export function executeSingleFile(filename: string, extension: string, stdInput: string): Promise<string> {
    return new Promise((resolve, reject) => {
        let command = EXECUTION_COMMANDS[extension];
        if (command) {
            command = command.replace(/\$\{file\}/g, filename).replace(/\$\{fileBase\}/g, filename.split('.')[0]);
            const startTime = Date.now();
            const child = spawn(command, { shell: true });

            const interval = setInterval(() => {
                if (child.pid) {
                    pidusage(child.pid, (err, stats) => {
                        if (err) {
                            clearInterval(interval);
                            return;
                        }

                        const executionTime = Date.now() - startTime;

                        if (stats.memory > MAX_MEMORY_USAGE) {
                            terminateProcess(child, interval);
                            reject('Memory usage exceeded limit');
                        } else if (executionTime > MAX_EXECUTION_TIME) {
                            terminateProcess(child, interval);
                            reject('Execution time exceeded limit');
                            
                        }
                    });
                } else {
                    clearInterval(interval);
                }
            }, 1000);


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
                    reject(`${stderr}`);
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



// function monitorProcess(process: ChildProcess) {
//     const startTime = Date.now();

//     const interval = setInterval(() => {
//         if (process.pid) {
//             pidusage(process.pid, (err, stats) => {
//                 if (err) {
//                     clearInterval(interval);
//                     return;
//                 }

//                 const executionTime = Date.now() - startTime;

//                 if (stats.memory > MAX_MEMORY_USAGE) {
//                     terminateProcess(process, interval);
//                     throw Error('Memory usage exceeded limit');
//                 } else if (executionTime > MAX_EXECUTION_TIME) {
//                     terminateProcess(process, interval);
//                     throw Error('Execution time exceeded limit');
//                 }
//             });
//         } else {
//             clearInterval(interval);
//         }
//     }, 1000);
// }

function terminateProcess(process: ChildProcess, interval: NodeJS.Timeout) {
    clearInterval(interval);
    process.kill();
}
