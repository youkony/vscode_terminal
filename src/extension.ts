
import * as vscode from 'vscode';
import TerminalWebview from './terminalWebview';


export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "serial-terminal" is now acfftive!');

	const terminal = new TerminalWebview(context);

	context.subscriptions.push(vscode.commands.registerCommand('serial-terminal.stopTerminal', () => {
		terminal.disconnect();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('serial-terminal.clear', () => {
		vscode.window.showInformationMessage('serial-terminal.clear!');
		terminal.clear();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('serial-terminal.startTerminal', () => {
		terminal.connect();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('serial-terminal.save', () => {
		terminal.save();
	}));

}

// this method is called when your extension is deactivated
export function deactivate() {}
