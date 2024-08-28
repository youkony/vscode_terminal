"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const terminalWebview_1 = require("./terminalWebview");
function activate(context) {
    console.log('\"serial-xterm\" is now acfftive!');
    const termView = new terminalWebview_1.default(context);
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
    context.subscriptions.push(vscode.commands.registerCommand('serial-xterm.send', (args) => {
        termView.send(args);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('serial-xterm.pipe', (args) => {
        vscode.commands.executeCommand(args.id, args);
    }));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map