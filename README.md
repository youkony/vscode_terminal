# Serial Xterm - VS Code Extension

## Overview

**Serial Xterm** is a Visual Studio Code extension designed to facilitate communication with serial devices directly from your editor. It provides an integrated terminal with features such as transmit (TX), receive (RX), terminal clearing, and the ability to dump terminal output for further analysis.

![Serial Xterm](https://raw.githubusercontent.com/youkony/contents/main/serial-xterm.gif)

## Usage

1. **Open and close Serial Port**
   - To open serial port, use the `Connect` icon or `Serial Xterm: Start Terminal With New Configuration` command in command palette (`Ctrl+Shift+P`).
   - To close serial port, use the `Disconnect` icon or `Serial Xterm: Stop Terminal` command.

2. **Transmit Data (TX):**
   - You can send data to the connected serial device by typing in the terminal.

3. **Receive Data (RX):**
   - Incoming data from the connected serial device will be displayed in the terminal in real-time.

4. **Clear Terminal:**
   - To clear the terminal output, use the `Clear` icon or `Serial Xterm:  Clear` command.

5. **Dump Terminal Output:**
   - To dump the current terminal session's output to an editor for the further analysis or logging purpose, use the `Dump` icon or `Serial Xterm: Dump Terminal Output to Editor` command
