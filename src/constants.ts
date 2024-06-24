import * as vscode from 'vscode';
import { platform } from 'os';

// retrieve configuration values
const maxExecutionTimeConfig = vscode.workspace.getConfiguration('cp-edge-case').get('Max Execution Time');
const maxMemoryUsageConfig = vscode.workspace.getConfiguration('cp-edge-case').get('Max Memory Usage');
const pythonCommand = vscode.workspace.getConfiguration('cp-edge-case').get("Python command");
const cppCommand = vscode.workspace.getConfiguration('cp-edge-case').get("CPP command");
const cCommand = vscode.workspace.getConfiguration('cp-edge-case').get("C command");
const javaCommand = vscode.workspace.getConfiguration('cp-edge-case').get("Java command");

// system values
const os: string = platform();

export const MAX_EXECUTION_TIME: number | undefined =
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