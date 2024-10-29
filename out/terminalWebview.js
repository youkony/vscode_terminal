"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_1 = require("vscode");
const multiStepSerialConfig_1 = require("./multiStepSerialConfig");
const serialport_1 = require("serialport");
class TerminalWebview {
    constructor(context) {
        this.context = context;
        this._rx_callback = '';
        this._extensionUri = context.extensionUri;
        context.subscriptions.push(vscode_1.window.registerWebviewViewProvider(TerminalWebview.id, this, {
            webviewOptions: {
                retainContextWhenHidden: true
            }
        }));
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            enableCommandUris: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(message => {
            switch (message.type) {
                case 'tx':
                    this._serialWrite(message.value);
                    break;
                case 'dump':
                    const date = new Date();
                    let log = 'serial-xterm.dump: ' + date.toLocaleString();
                    log += '\r\n----------------\r\n';
                    log += message.value;
                    vscode.workspace.openTextDocument({
                        language: 'text',
                        content: log
                    }).then(doc => {
                        // to do
                    });
                    break;
                case 'ctrl_c':
                    vscode.env.clipboard.writeText(message.value);
                    //vscode.window.showInformationMessage('ctrl+c');
                    break;
                case 'ctrl_v':
                    vscode.env.clipboard.readText().then(clipText => { this._serialWrite(new TextEncoder().encode(clipText)); });
                    //vscode.window.showInformationMessage('ctrl+v');
                    break;
            }
        });
    }
    async connect() {
        const config = await (0, multiStepSerialConfig_1.default)(this.context.globalState.get('recentPortSettings') || []);
        let port;
        try {
            port = await new Promise((res, rej) => {
                let port = new serialport_1.SerialPort({
                    path: config.path,
                    baudRate: parseInt(config.baudRate),
                    dataBits: config.dataBits,
                    parity: config.parity,
                    stopBits: config.stopBits,
                }, (err) => {
                    err ? rej(`${config.path} can not open. Check the serial is conneted and retry.`) : res(port);
                });
            });
            this._port = port;
        }
        catch (error) {
            this._postMessage({
                type: 'rx',
                value: `\x1b[31m${error}\x1b[m\r\n`
            });
            return;
        }
        const configs = this.context.globalState.get('recentPortSettings') || [];
        configs.unshift(config);
        if (configs.length > 3) {
            configs.pop();
        }
        this.context.globalState.update('recentPortSettings', configs);
        this._postMessage({
            type: 'connected',
            value: true
        });
        let self = this;
        port.on('readable', function () {
            let message = { type: 'rx', value: port.read().toString() };
            //console.log(message.value); 
            self._postMessage(message);
        });
        vscode_1.commands.executeCommand('setContext', 'serial-xterm:running', !0);
    }
    async disconnect() {
        this._port?.close(() => {
            vscode_1.commands.executeCommand('setContext', 'serial-xterm:running', !1);
            this._port = undefined;
            this._postMessage({
                type: 'connected',
                value: false
            });
        });
    }
    async clear() {
        this._postMessage({ type: 'clear' });
    }
    async dump() {
        this._postMessage({ type: 'dump' });
    }
    async send(args) {
        if (this._port?.isOpen && args != undefined) {
            this._serialWrite(args.value);
        }
        else {
            vscode.window.showInformationMessage('Disconnected or Argument is \"UNDEFINED\".');
        }
    }
    async setRxCallback(args) {
        if (args != undefined) {
            this._rx_callback = args.rx_callback;
            vscode.window.showInformationMessage('Registered rx_callback is \"' + args.rx_callback + '\"');
        }
        else {
            vscode.window.showInformationMessage('Argument is \"UNDEFINED\".');
        }
    }
    _getHtmlForWebview(webview) {
        // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
        const mainUri = webview.asWebviewUri(vscode_1.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        const toolURI = webview.asWebviewUri(vscode_1.Uri.joinPath(this._extensionUri, 'media', 'tool.js'));
        const usageUri = webview.asWebviewUri(vscode_1.Uri.joinPath(this._extensionUri, 'media', 'usage.html'));
        const XtermUri = webview.asWebviewUri(vscode_1.Uri.joinPath(this._extensionUri, 'node_modules', 'xterm', 'lib', 'xterm.js'));
        const fitUri = webview.asWebviewUri(vscode_1.Uri.joinPath(this._extensionUri, 'node_modules', 'xterm-addon-fit', 'lib', 'xterm-addon-fit.js'));
        // Do the same for the stylesheet.
        const styleVSCodeUri = webview.asWebviewUri(vscode_1.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
        const styleXtermUri = webview.asWebviewUri(vscode_1.Uri.joinPath(this._extensionUri, 'node_modules', 'xterm', 'css', 'xterm.css'));
        const styleToolURI = webview.asWebviewUri(vscode_1.Uri.joinPath(this._extensionUri, 'media', 'tool.css'));
        // Use a nonce to only allow a specific script to be run.
        const nonce = getNonce();
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<link href="${styleXtermUri}" rel="stylesheet">
				<link href="${styleToolURI}" rel="stylesheet">
				<script nonce="${nonce}" src="${XtermUri}"></script>
				<script nonce="${nonce}" src="${fitUri}"></script>
			</head>
			<body oncontextmenu="return paste()"> 
				<!-- tool btn --> 
				<input id="Tool" type="button" value="Tool" class="Tool"><br>

				<!-- terminal --> 
				<div id="terminal"></div>
				<script nonce="${nonce}" src="${mainUri}"></script>

				<!-- tool-view section --> 
				<section id='Tool_view' >
					<h3>Text Hilightling</h3><br>
					<p style="color: lime;">Green</p> 
					<input type="text" id="hilight_green" value="success|pass|ok|start" size="50"><br>
					<p style="color: yellow;">Yellow</p> 
					<input type="text" id="hilight_yellow" value="warnning|caution" size="50"><br>
					<p style="color: red;">Red</p> 
					<input type="text" id="hilight_red" value="error|fail" size="50"><br><br>
					<input type="checkbox" id="hilight_en" name="Hilight_en" >
        			<label for="hilight_en">Enable Highlighting</label><br><br>
    				<input id="Apply" type="button" value="Apply" class="Tool"><br>
					<input id="Cancel" type="button" value="Cancel" class="Tool">
				</section>
				<script nonce="${nonce}" src="${toolURI}"}</script>
			</body>
			</html>`;
    }
    _postMessage(data) {
        if (this._view) {
            //this._view.show?.(true);
            this._view.webview.postMessage(data);
            this._remoteMessage(data);
        }
    }
    _remoteMessage(data) {
        const _data = data;
        if (_data.type == 'rx' && this._rx_callback?.includes('.serial-xterm.rx')) {
            vscode.commands.executeCommand(this._rx_callback, _data);
        }
    }
    _serialWrite(buffer) {
        if (this._port?.isOpen) {
            this._port.write(buffer);
        }
    }
}
exports.default = TerminalWebview;
TerminalWebview.id = 'serial-xterm-view';
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=terminalWebview.js.map