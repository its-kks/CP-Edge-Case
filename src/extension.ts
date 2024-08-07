import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';

// Function to dynamically import node-fetch
async function getFetch() {
    const { default: fetch } = await import('node-fetch');
    return fetch;
}

export function activate(context: vscode.ExtensionContext) {
    vscode.commands.registerCommand('cp-edge-case.chatCopilot', async () => {
        const messages = [
            vscode.LanguageModelChatMessage.User('hello can you generate min segment tree class in python'),
        ];

        const model = await vscode.lm.selectChatModels({
            vendor: 'copilot',
        });
        const response = await model[0].sendRequest(messages);
        
        let responseText = "";
        for await (const fragment of response.text) {
            responseText += fragment;
        }
        vscode.window.showWarningMessage(responseText);

        const fetchHTML = async (url: string) => {
            try {
                const fetch = await getFetch(); // Import fetch dynamically here
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const html = await response.text();
                return html;
            } catch (error) {
                console.error('Error fetching the HTML data:', error);
                throw error;
            }
        }

        // Usage example
        fetchHTML('https://codeforces.com/problemset/problem/954/G')
            .then(html => {
                console.log(html);
                // Do something with the HTML
            })
            .catch(error => {
                console.error('Error:', error);
            });

    });
    const sidebarProvider = new SidebarProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            "cp-edge-case-sidebar",
            sidebarProvider
        )
    );
}

export function deactivate() { }
