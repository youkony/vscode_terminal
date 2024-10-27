
import * as vscode from 'vscode';
import TerminalWebview from './terminalWebview';
import { Terminal } from 'xterm';

export function activate(context: vscode.ExtensionContext) {
	console.log('Activating Serial XTerm')
	const termView = new TerminalWebview(context);
	context.subscriptions.push(vscode.commands.registerCommand('serial-xterm.disconnect', () => {
		termView.disconnect();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('serial-xterm.connect', () => {
		termView.connect();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('serial-xterm.clear', () => {
		termView.clear();
	})); 
	context.subscriptions.push(vscode.commands.registerCommand('serial-xterm.dump', () => {
		termView.dump();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('serial-xterm.send', (args: any) => {
		termView.send(args);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('serial-xterm.rx_callback', (args: any) => {
		termView.setRxCallback(args);
	}));
	console.log('Serial XTerm has been activated')
}

// this method is called when your extension is deactivated
export function deactivate() {

}
