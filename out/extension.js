"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const terminalWebview_1 = require("./terminalWebview");
function activate(context) {
    console.log('Activating Serial XTerm');
    const termView = new terminalWebview_1.default(context);
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
    context.subscriptions.push(vscode.commands.registerCommand('serial-xterm.send', (args) => {
        termView.send(args);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('serial-xterm.rx_callback', (args) => {
        termView.setRxCallback(args);
    }));
    console.log('Serial XTerm has been activated');
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map