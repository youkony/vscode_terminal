
import * as vscode from 'vscode';
import TerminalWebview from './terminalWebview';
import { Terminal } from 'xterm';

export function activate(context: vscode.ExtensionContext) {

	console.log('\"serial-xterm\" is now acfftive!');

	const termView = new TerminalWebview(context);

	context.subscriptions.push(vscode.commands.registerCommand('serial-xterm.stop', () => {
		termView.disconnect();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('serial-xterm.clear', () => {
		vscode.window.showInformationMessage('serial-xterm.clear!');
		termView.clear();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('serial-xterm.start', () => {
		termView.connect();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('serial-xterm.dump', () => {
		termView.dump();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('serial-xterm.send', (args: any) => {
		termView.send(args);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('serial-xterm.pipe', (args: any) => {
		if(args.pipe == 'serial-xterm.send') {  // self test
			vscode.commands.executeCommand(args.pipe, args);
		} 
		else {
			termView.setPipe(args);
		}
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {

}
