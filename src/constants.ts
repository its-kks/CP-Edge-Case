import * as vscode from 'vscode';
import { platform } from 'os';

// retrieve configuration values
const maxExecutionTimeConfig = vscode.workspace.getConfiguration('cp-edge-case').get('Max Execution Time');
const maxMemoryUsageConfig = vscode.workspace.getConfiguration('cp-edge-case').get('Max Memory Usage');
const pythonCommand = vscode.workspace.getConfiguration('cp-edge-case').get("Python command");
const cppCommand = vscode.workspace.getConfiguration('cp-edge-case').get("CPP command");
const cCommand = vscode.workspace.getConfiguration('cp-edge-case').get("C command");
const javaCommand = vscode.workspace.getConfiguration('cp-edge-case').get("Java command");
const fileType : string | undefined = vscode.workspace.getConfiguration('cp-edge-case').get("File Type");

// system values
const os: string = platform();

export const MAX_EXECUTION_TIME: number =
    typeof maxExecutionTimeConfig === 'number' ? maxExecutionTimeConfig : 5000;
export const MAX_MEMORY_USAGE: number =
    typeof maxMemoryUsageConfig === 'number' ? 1024 * 1024 * 1024 * maxMemoryUsageConfig : 1024 * 1024 * 1024 * 1;
export const PATH_SEPARATOR: string = (os === 'win32') ? "\\" : "/";
export const EXECUTION_COMMANDS: { [key: string]: string | undefined } = {
    "py": pythonCommand + " ${file}",
    "cpp": cppCommand + " ${file} -o ${fileBase} && ${fileBase}",
    "java": javaCommand + " ${file} && java ${fileBase}",
    "c": cCommand + " ${file} -o ${fileBase} && ${fileBase}",
    "cc": cppCommand + " ${file} -o ${fileBase} && ${fileBase}",
};

export const AUTO_GENERATED_FILE_TYPE = fileType;

export const PROMPT_COUNT_PRESENT = `I am providing you a description of input to a program of competetive programming
    question. Your task is to generate complete {language} code to randomly generate a single
    test case. The program should not mention the number of test case in in the starting
    of of the test case ( that is should not print 1 since we are generating single test case).
    The response should be such that I copy and paste complete response and it runs perfectly don't add text before or after program.
    Description: {desc} Example: {testcase}
`
export const PROMPT_COUNT_ABSENT = `
`;


export const FILE_NAME: { [key: string]: string } = {
    python: "AutoGenerate.py",
    cpp:"AutoGenerate.cpp",
}