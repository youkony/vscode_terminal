//@ts-check

const { flattenDiagnosticMessageText, isTemplateMiddleOrTemplateTail } = require("typescript");
const { FitAddon } = require("xterm-addon-fit");

var term;
var vscode;

/**
 * @param {{ innerWidth: number; innerHeight: number; }} win
 */
function calculateSize(win) {
  var cols = Math.max(60, Math.min(150, (win.innerWidth) / 7)) | 0;
  var rows = Math.max(10, Math.min(80, (win.innerHeight - 40) / 12)) | 0;
  return [cols, rows];
}

let lineBuffer = '';
let latestValue = 0;
let encoder;
let fit;

async function serialWrite(data) {
	encoder = new TextEncoder();
	const dataArrayBuffer = encoder.encode(data);
  vscode.postMessage({
    type: 'stdin',
    value: dataArrayBuffer
  });
}

let txData = '';
function onCmdLine() {
  console.log('cmdLine: ' + term.buffer.active.getLine(term.buffer.active.cursorY).transslateToString(false));
}

function paste() {
  const copied = term.getSelection();
  term.clearSelection();
  serialWrite(copied);
  return false;
}

(function () {
  window.onload = function() {
    var size = calculateSize(self);
    // @ts-ignore
    term = new Terminal({
      screenKeys: true,
      cursorBlink: false,
      enableBold: true,
      cols: 150,
      rows: 40
    });

    term.onData(function (data){
      serialWrite(data);
      onCmdLine();
    });

    // @ts-ignore
    fit = new FitAddon.FitAddon();
    term.loadAddon(fit);

    term.open(document.getElementById("terminal"));
  };

  // @ts-ignore
  vscode = acquireVsCodeApi();
  const oldState = vscode.getState() || {};
  window.addEventListener('message', event => {
      const message = event.data; // The json data that the extension sent
      switch (message.type) {
        case 'connected':
          if (message.value) {
            term.write('\x1b[31mConnected success !\x1b[m\r\n');
          } else {
            term.write('\x1b[31m\r\nDisconnected !\x1b[m\r\n');
          }
          break;
        case 'stdout':
          if (message.value) {
            term.write(message.value);
          }
          break;
        case 'clear':
          term.reset();
          break;
        case 'save':
          term.selectAll();
          const buf = term.getSelection();
          term.clearSelection();
          vscode.postMessage({
            type: 'save',
            value: buf
          });
          break;
        default:
          break;
      }
  });
}());
