
import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';

export function activate(context: vscode.ExtensionContext) {
	// vscode.commands.registerCommand('cp-edge-case.chatCopilot', async () => {
	// 	const messages = [
	// 		vscode.LanguageModelChatMessage.User('You are a cat! Your job is to explain computer science concepts in the funny manner of a cat. Always start your response by stating what concept you are explaining. Always include code samples.'),
	// 		vscode.LanguageModelChatMessage.User('Explain red black trees')
	// 	];

	// 	const model = await vscode.lm.selectChatModels({
	// 		vendor: 'copilot',
	// 	});
	// 	console.log("hello");
	// 	const response = await model[0].sendRequest(messages);

	// 	let responseText = "";
	// 	for await (const fragment of response.text) {
	// 		responseText += fragment;
	// 	}
	// 	vscode.window.showWarningMessage(responseText);

	// });
	const sidebarProvider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			"cp-edge-case-sidebar",
			sidebarProvider
		)
	);

}

export function deactivate() { }