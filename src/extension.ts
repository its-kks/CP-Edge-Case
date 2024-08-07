import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';

// Function to dynamically import node-fetch
async function getFetch() {
    const { default: fetch } = await import('node-fetch');
    return fetch;
}

export function activate(context: vscode.ExtensionContext) {
    const sidebarProvider = new SidebarProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            "cp-edge-case-sidebar",
            sidebarProvider
        )
    );
}

export function deactivate() { }
