
import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';

export function activate(context: vscode.ExtensionContext) {
	vscode.commands.registerCommand('cp-edge-case.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from CP Edge Case!');
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