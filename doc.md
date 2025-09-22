# SIMD VS Code Extension – Packaging & Deployment Notes

## Versioning & Packaging
- Every time we make a change, we must **bump the version number** in:
  - `README.md`
  - `package.json`
- After updating, run the packaging command:
  ```bash
  npm run build
  vsce package

Upload the new package.

Delete the old package to avoid conflicts.

## Local Installation (Testing)
After packaging, install the extension locally:
```bash
    code install-extension your-package-name.vsix
```

or after the git clone
press f5 inside extension.ts to run local dev based on the npm run build

## Endpoints
- When updating endpoints, modify:
    - simdAi.ts
    - config.ts

## License
- Apache 2.0

## Project Structure
- **extension.ts**  
  Entry point of the extension. Responsible for activation and registering all commands.

- **syntaxHighlighting.ts**  
  Contains logic for syntax highlighting of intrinsics and hover tooltips.

- **config.ts**  
  Handles configuration and API key management.

- **ChatViewProvider.ts**, **ChatWebviewHtml.ts**, **media/chat.html**  
  Implements the sidebar chat view, including its UI and communication logic.

- **utils/**  
  Utility functions used for managing chat sessions and message history.

- **translation/**  
  Contains logic for the translation commands across different architectures.

- **api/** 
  Implements various fetches