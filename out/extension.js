"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const terminalWebview_1 = require("./terminalWebview");
function activate(context) {
    console.log('Congratulations, your extension "serial-terminal" is now acfftive!');
    const terminal = new terminalWebview_1.default(context);
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
function deactivate() { }
//# sourceMappingURL=extension.js.map