import * as vscode from 'vscode';
import { spawn, ChildProcess } from 'child_process';
import { EXECUTION_COMMANDS } from '../constants';

export default async function handleAutoGenerate(pathOne: string, pathTwo: string) {
  pathOne = pathOne.replace(/ /g, '\\ ');
  pathTwo = pathTwo.replace(/ /g, '\\ ');
  let command = EXECUTION_COMMANDS["py"]?.replace(/\$\{file\}/g, pathOne);
  let result = {
    "url": '',
    "input": '',
    "inputDescription": ''
  }
  if (command) {
    try {
      // run server
      let output: string = await runPythonScript(command);
      let outputArray: string[] = output.split('©');
      result.input = outputArray[0];
      result.url = outputArray[1];

      if (result.url) {

        command = EXECUTION_COMMANDS["py"]?.replace(/\$\{file\}/g, pathTwo) + " " + result.url;

        // scrap data
        output = await runPythonScript(command);
        result.inputDescription = output;
      }
      else{
        vscode.window.showWarningMessage('Competetive Companion extension button not pressed');
        throw new Error("Competetive Companion extension button not pressed");
      }
    }
    catch (error) {
      console.error(error);
      vscode.window.showErrorMessage('Failed to fetch input data');
    }

  }
  return result;
}

export function runPythonScript(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (command) {
      const child = spawn(command, { shell: true });

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
      reject(`Command is empty`);
    }
  });
}