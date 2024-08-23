
import * as vscode from 'vscode';
import TerminalWebview from './terminalWebview';


export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "serial-terminal" is now acfftive!');

	const terminal = new TerminalWebview(context);

	context.subscriptions.push(vscode.commands.registerCommand('serial-xterm.stop', () => {
		terminal.disconnect();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('serial-xterm.clear', () => {
		vscode.window.showInformationMessage('serial-xterm.clear!');
		terminal.clear();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('serial-xterm.start', () => {
		terminal.connect();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('serial-xterm.dump', () => {
		terminal.dump();
	}));

}

// this method is called when your extension is deactivated
export function deactivate() {}
