import * as vscode from 'vscode';
import { ExtensionContext, commands, window, WebviewView, Webview, Uri, WebviewViewResolveContext, CancellationToken, SnippetString, WebviewViewProvider } from 'vscode';
import multiSerailConfig from './multiStepSerialConfig';
import { SerialPort } from 'serialport';
import { writeFile } from 'fs-extra';

export default class TerminalWebview implements WebviewViewProvider {

	public static readonly id = 'serial-xterm-view';

	private _port?: SerialPort;
	private _view?: WebviewView;
    private readonly _extensionUri: Uri;
	private _pipe?: string;

	constructor(protected context: ExtensionContext) {
    this._extensionUri = context.extensionUri;
    context.subscriptions.push(window.registerWebviewViewProvider(TerminalWebview.id, this, {
			webviewOptions: {
				retainContextWhenHidden: true
			}
		}));
    }

	public resolveWebviewView(
		webviewView: WebviewView,
		context: WebviewViewResolveContext,
		_token: CancellationToken,
	) {
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
				case 'stdin':
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
					}).then( doc => {
						// to do
					});
					break;
				case 'copy':
					vscode.env.clipboard.writeText(message.value);
					break;
				case 'cmd':
					console.log('cmd: ' + message.value);
					break;
			}
		});
	}

	public async connect() {
		const config = await multiSerailConfig(this.context.globalState.get('recentPortSettings') || []);
		let port: SerialPort;
		try {
			port = await new Promise((res, rej) => {
				let port = new SerialPort({
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
		} catch (error) {
			this._postMessage({
				type: 'stdout',
				value: `\x1b[31m${error}\x1b[m\r\n`
			});
			return;
		}
		const configs: Array<any> = this.context.globalState.get('recentPortSettings') || [];
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
			self._postMessage({
				type: 'stdout',
				value: port.read().toString()
			});
		});
		
		commands.executeCommand('setContext', 'serial-xterm:running', !0);
	}

	public async disconnect() {
		this._port?.close(() => {
			commands.executeCommand('setContext', 'serial-xterm:running', !1);
			this._port = undefined;
			this._postMessage({
				type: 'connected',
				value: false
			});
		});
	}

	public async setPipe(args: any) {
		this._pipe = args.id;
	}

	public async clear() {
		this._postMessage({type: 'clear'});
	}

	public async dump() {
		this._postMessage({type: 'dump'});
	}

	public async send(args: any) {
		if (this._port?.isOpen) {
			this._serialWrite(args.value);
		}
		else{
			vscode.window.showInformationMessage('Port is not opened. Can not send: \"' + args.value + '\"');
		}
	}

	private _getHtmlForWebview(webview: Webview) {
		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const mainUri = webview.asWebviewUri(Uri.joinPath(this._extensionUri, 'media', 'main.js'));
		const helpUri = webview.asWebviewUri(Uri.joinPath(this._extensionUri, 'media', 'help.js'));
		const usageUri = webview.asWebviewUri(Uri.joinPath(this._extensionUri, 'media', 'usage.html'));

		const XtermUri = webview.asWebviewUri(Uri.joinPath(this._extensionUri, 'node_modules', 'xterm', 'lib', 'xterm.js'));
		const fitUri = webview.asWebviewUri(Uri.joinPath(this._extensionUri, 'node_modules', 'xterm-addon-fit', 'lib', 'xterm-addon-fit.js'));

		// Do the same for the stylesheet.
		const styleVSCodeUri = webview.asWebviewUri(Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
		const styleXtermUri = webview.asWebviewUri(Uri.joinPath(this._extensionUri, 'node_modules', 'xterm', 'css', 'xterm.css'));
		const styleHelpUri = webview.asWebviewUri(Uri.joinPath(this._extensionUri, 'media', 'help.css'));

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<link href="${styleXtermUri}" rel="stylesheet">
				<link href="${styleHelpUri}" rel="stylesheet">
				<script nonce="${nonce}" src="${XtermUri}"}</script>
				<script nonce="${nonce}" src="${fitUri}"}</script>
			</head>
			<body oncontextmenu="return paste()">
				<!-- help btn --> 
				<input id='help' type="button" value="Help" class="help"><br>

				<!-- terminal --> 
				<div id="terminal"></div>
				<script nonce="${nonce}" src="${mainUri}"></script>

				<!-- help-view section --> 
				<section>
					<h1>Serial Xterm - v0.9.2</h1>
					<p><strong>Serial Xterm</strong> is a Visual Studio Code extension designed to facilitate communication with serial devices directly from your editor. It provides an integrated terminal with features such as transmit (TX), receive (RX), terminal clearing, and the ability to dump terminal output for further analysis.</p>	
					<h2>Features</h2>
					<ul>
						<li><strong>Transmit (TX):</strong> Send data to the connected serial device directly from the VS Code terminal.</li>
						<li><strong>Receive (RX):</strong> Receive and display data from the serial device in real-time.</li>
						<li><strong>Terminal Clear:</strong> Clear the terminal to manage output more effectively.</li>
						<li><strong>Dump Terminal Output:</strong> Dump the current terminal output to a new editor for further analysis or logging purposes.</li>
					</ul>

					<textarea id="help-view" class="help-view"></textarea> 
				</section>
				<script nonce="${nonce}" src="${helpUri}"}</script>
			</body>
			</html>`;
	}

	private _postMessage(data: object) {
		if (this._view) {
			//this._view.show?.(true);
			this._view.webview.postMessage(data);
			this._pipeMessage(data);
		}
	}

	private _pipeMessage(data: object) {
		const _data: any = data;
		if(_data.type == 'stdout' && this._pipe?.includes('.pipe')) {
			vscode.commands.executeCommand(this._pipe, _data);
		} 
	}

	private _serialWrite(buffer: Uint8Array) {
		if (this._port?.isOpen) {
			this._port.write(buffer);
		}
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}