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
	private _rx_callback: string = '';

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
					}).then( doc => {
						// to do
					}); 
					break;
				case 'ctrl_c':
					vscode.env.clipboard.writeText(message.value);
					//vscode.window.showInformationMessage('ctrl+c');
					break;
				case 'ctrl_v':
					vscode.env.clipboard.readText().then(clipText => {this._serialWrite(new TextEncoder().encode(clipText));});            		
            		//vscode.window.showInformationMessage('ctrl+v');
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
				type: 'rx',
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
			let message = {type:'rx', value: port.read().toString()};
			//console.log(message.value); 
			self._postMessage(message);
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

	public async clear() {
		this._postMessage({type: 'clear'});
	}

	public async dump() {
		this._postMessage({type: 'dump'});
	}

	public async send(args: any) {
		if (this._port?.isOpen && args != undefined) {
			this._serialWrite(args.value);
		}
		else{
			vscode.window.showInformationMessage('Disconnected or Argument is \"UNDEFINED\".');
		}
	}

	public async setRxCallback(args: any) {
		if(args != undefined) {
			this._rx_callback = args.rx_callback;
			vscode.window.showInformationMessage('Registered rx_callback is \"' + args.rx_callback + '\"');
		} else {
			vscode.window.showInformationMessage('Argument is \"UNDEFINED\".');
		}
	}

	private _getHtmlForWebview(webview: Webview) {
		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const mainUri = webview.asWebviewUri(Uri.joinPath(this._extensionUri, 'media', 'main.js'));
		const toolURI = webview.asWebviewUri(Uri.joinPath(this._extensionUri, 'media', 'tool.js'));
		const usageUri = webview.asWebviewUri(Uri.joinPath(this._extensionUri, 'media', 'usage.html'));

		const XtermUri = webview.asWebviewUri(Uri.joinPath(this._extensionUri, 'node_modules', 'xterm', 'lib', 'xterm.js'));
		const fitUri = webview.asWebviewUri(Uri.joinPath(this._extensionUri, 'node_modules', 'xterm-addon-fit', 'lib', 'xterm-addon-fit.js'));

		// Do the same for the stylesheet.
		const styleVSCodeUri = webview.asWebviewUri(Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
		const styleXtermUri = webview.asWebviewUri(Uri.joinPath(this._extensionUri, 'node_modules', 'xterm', 'css', 'xterm.css'));
		const styleToolURI = webview.asWebviewUri(Uri.joinPath(this._extensionUri, 'media', 'tool.css'));

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
					<input type="text" id="hilight_green" value="success|pass|ok|start|finish" size="50"><br>
					<p style="color: yellow;">Yellow</p> 
					<input type="text" id="hilight_yellow" value="warnning|caution|delay" size="50"><br>
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

	private _postMessage(data: object) {
		if (this._view) {
			//this._view.show?.(true);
			this._view.webview.postMessage(data);
			this._remoteMessage(data);
		}
	}

	private _remoteMessage(data: object) {
		const _data: any = data;
		if(_data.type == 'rx' && this._rx_callback?.includes('.serial-xterm.rx')) {
			vscode.commands.executeCommand(this._rx_callback, _data);
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