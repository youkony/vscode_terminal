"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = multiSerailConfig;
const vscode_1 = require("vscode");
const serialport_1 = require("serialport");
const TITLE = 'Serial port configuration';
class InputFlowAction {
}
InputFlowAction.back = new InputFlowAction();
InputFlowAction.cancel = new InputFlowAction();
InputFlowAction.resume = new InputFlowAction();
class MultiStepInput {
    constructor() {
        this.steps = [];
    }
    static async run(start) {
        const input = new MultiStepInput();
        return input.stepThrough(start);
    }
    async stepThrough(start) {
        let step = start;
        while (step) {
            this.steps.push(step);
            if (this.current) {
                this.current.enabled = false;
                this.current.busy = true;
            }
            try {
                step = await step(this);
            }
            catch (err) {
                if (err === InputFlowAction.back) {
                    this.steps.pop();
                    step = this.steps.pop();
                }
                else if (err === InputFlowAction.resume) {
                    step = this.steps.pop();
                }
                else if (err === InputFlowAction.cancel) {
                    step = undefined;
                }
                else {
                    throw err;
                }
            }
        }
        if (this.current) {
            this.current.dispose();
        }
    }
    async showQuickPick({ title, step, totalSteps, items, activeItem, placeholder, buttons, shouldResume }) {
        const disposables = [];
        try {
            return await new Promise((resolve, reject) => {
                const input = vscode_1.window.createQuickPick();
                input.title = title;
                input.ignoreFocusOut = !0;
                input.step = step;
                input.totalSteps = totalSteps;
                input.placeholder = placeholder;
                input.items = items;
                if (activeItem) {
                    input.activeItems = [activeItem];
                }
                input.buttons = [
                    ...(this.steps.length > 1 ? [vscode_1.QuickInputButtons.Back] : []),
                    ...(buttons || [])
                ];
                disposables.push(input.onDidTriggerButton(item => {
                    if (item === vscode_1.QuickInputButtons.Back) {
                        reject(InputFlowAction.back);
                    }
                    else {
                        resolve(item);
                    }
                }), input.onDidChangeSelection(items => resolve(items[0])), input.onDidHide(() => {
                    (async () => {
                        reject(shouldResume && await shouldResume() ? InputFlowAction.resume : InputFlowAction.cancel);
                    })()
                        .catch(reject);
                }));
                if (this.current) {
                    this.current.dispose();
                }
                this.current = input;
                this.current.show();
            });
        }
        finally {
            disposables.forEach(d => d.dispose());
        }
    }
    async showInputBox({ title, step, totalSteps, value, prompt, validate, buttons, shouldResume }) {
        const disposables = [];
        try {
            return await new Promise((resolve, reject) => {
                const input = vscode_1.window.createInputBox();
                input.title = title;
                input.step = step;
                input.totalSteps = totalSteps;
                input.value = value || '';
                input.prompt = prompt;
                input.buttons = [
                    ...(this.steps.length > 1 ? [vscode_1.QuickInputButtons.Back] : []),
                    ...(buttons || [])
                ];
                let validating = validate('');
                disposables.push(input.onDidTriggerButton(item => {
                    if (item === vscode_1.QuickInputButtons.Back) {
                        reject(InputFlowAction.back);
                    }
                    else {
                        resolve(item);
                    }
                }), input.onDidAccept(async () => {
                    const value = input.value;
                    input.enabled = false;
                    input.busy = true;
                    if (!(await validate(value))) {
                        resolve(value);
                    }
                    input.enabled = true;
                    input.busy = false;
                }), input.onDidChangeValue(async (text) => {
                    const current = validate(text);
                    validating = current;
                    const validationMessage = await current;
                    if (current === validating) {
                        input.validationMessage = validationMessage;
                    }
                }), input.onDidHide(() => {
                    (async () => {
                        reject(shouldResume && await shouldResume() ? InputFlowAction.resume : InputFlowAction.cancel);
                    })()
                        .catch(reject);
                }));
                if (this.current) {
                    this.current.dispose();
                }
                this.current = input;
                this.current.show();
            });
        }
        finally {
            disposables.forEach(d => d.dispose());
        }
    }
}
async function multiSerailConfig(configs) {
    const state = {};
    console.log(configs);
    await MultiStepInput.run(input => pickPrePort(input, state, configs));
    return state;
}
async function pickPrePort(input, state, configs) {
    if (!configs?.length) {
        return (input) => pickPath(input, state);
    }
    const resourceGroups = configs.map(port => ({
        label: port.path,
        description: `baudRate: ${port.baudRate}, dataBits: ${port.dataBits}, parity: ${port.parity}, stopBits: ${port.stopBits}`,
        port: port
    }));
    resourceGroups.unshift({ label: '[other]' });
    const pick = await input.showQuickPick({
        title: TITLE,
        step: 1,
        totalSteps: 1,
        placeholder: 'Select serial port configuration',
        items: resourceGroups,
        buttons: [],
        shouldResume: shouldResume
    });
    const port = pick?.port || undefined;
    if (port) {
        state.path = port.path;
        state.baudRate = port.baudRate;
        state.dataBits = port.dataBits;
        state.stopBits = port.stopBits;
        state.parity = port.parity;
    }
    else {
        return (input) => pickPath(input, state);
    }
}
async function pickPath(input, state) {
    const resourceGroups = (await serialport_1.SerialPort.list()).map(port => ({ label: port.path }));
    const pick = await input.showQuickPick({
        title: TITLE,
        step: 1,
        totalSteps: 5,
        placeholder: 'Choose a serial port',
        items: resourceGroups,
        buttons: [],
        shouldResume: shouldResume
    });
    state.path = pick?.label;
    return (input) => pickBaudRate(input, state);
}
async function pickBaudRate(input, state) {
    const resourceGroups = ['[other]', '115200', '57600', '38400', '19200', '9600', '4800'].map(item => ({ label: item }));
    const pick = await input.showQuickPick({
        title: TITLE,
        step: 2,
        totalSteps: 5,
        placeholder: 'Choose baud-rate',
        items: resourceGroups,
        buttons: [],
        shouldResume: shouldResume
    });
    state.baudRate = pick?.label;
    if (pick.label === '[other]') {
        const pick = await input.showInputBox({
            title: TITLE,
            step: 2,
            totalSteps: 5,
            prompt: 'Input baud-rate',
            value: '',
            validate: async (name) => {
                return undefined;
            },
            shouldResume: shouldResume
        });
        state.baudRate = pick;
    }
    return (input) => pickDataBits(input, state);
}
async function pickDataBits(input, state) {
    const resourceGroups = ['8', '7', '6', '5'].map(item => ({ label: item }));
    const pick = await input.showQuickPick({
        title: TITLE,
        step: 3,
        totalSteps: 5,
        placeholder: 'Select data bits',
        items: resourceGroups,
        buttons: [],
        shouldResume: shouldResume
    });
    state.dataBits = (pick?.label ? parseInt(pick?.label) : 8);
    return (input) => pickParity(input, state);
}
async function pickParity(input, state) {
    const resourceGroups = ['none', 'even', 'mark', 'odd', 'space'].map(item => ({ label: item }));
    const pick = await input.showQuickPick({
        title: TITLE,
        step: 4,
        totalSteps: 5,
        placeholder: 'Select parity',
        items: resourceGroups,
        buttons: [],
        shouldResume: shouldResume
    });
    state.parity = (pick?.label ?? 'none');
    return (input) => pickStopBits(input, state);
}
async function pickStopBits(input, state) {
    const resourceGroups = ['1', '2'].map(item => ({ label: item }));
    const pick = await input.showQuickPick({
        title: TITLE,
        step: 5,
        totalSteps: 5,
        placeholder: 'Select stop bits',
        items: resourceGroups,
        buttons: [],
        shouldResume: shouldResume
    });
    state.stopBits = (pick?.label ? parseInt(pick?.label) : 8);
}
function shouldResume() {
    // Could show a notification with the option to resume.
    return new Promise((resolve, reject) => {
        // noop
    });
}
//# sourceMappingURL=multiStepSerialConfig.js.map