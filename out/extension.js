"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const terminalWebview_1 = require("./terminalWebview");
function activate(context) {
    console.log('Congratulations, your extension "serial-terminal" is now acfftive!');
    const terminal = new terminalWebview_1.default(context);
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
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map