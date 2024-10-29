# VS Code Extension Development
Here is the summarized VS Code Extension development How-to.
Visit the official VS Code guide (https://code.visualstudio.com/api/get-started/your-first-extension) to read full contents.

## Development Environment
   1. **Host Machine**
      - Any Machine & OS that can run vs-code
   2. **Programming Language**
      - Java Script, Type Script
   3. **Required Softwares**
      - VS Code, nodejs, npm, nvm, yo
   4. **Setup**
      - $ sudo apt update && sudo apt upgrade
      - $ sudo apt-get install curl
      - $ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
      - $ source ~/.bashrc
      - $ nvm install --lts
      - $ npm install -g yo generator-code
      - $ npm install @vscode/vsce -g

## Hollo-World Project
   1. Create Scaffolding project using **yo**
      $ yo code
   2. Edit package.json
      {
         "name": "hello-ext",
         "displayName": "hello-ext",
         "version": "0.0.1"
         "engines": {
            "vscode": "^1.48.0"
         }
         "activationEvents":`[
            "onCommand:hello.ext"
         ]`,
      }     
   4. Edit README.md
   5. Packaging the Extension
      $ vsce package
   6. Install
      Install using the memu - **install from vsix**
   7. Test
      Open command palette (**shift-ctrl-p**) and select **hello.ext**           

## Market Registeration
   1. login **https://marketplace.visualstudio.com/vscode**
   2. Register vsix in **Publish extension**
