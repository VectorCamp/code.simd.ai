# SIMD VS Code Extension – Packaging & Deployment Notes

## Versioning & Packaging
- Every time we make a change, we must **bump the version number** in:
  - `README.md`
  - `package.json`
- After updating, run the packaging command:
  ```bash
  npm run build
  vsce package --allow-package-env-file


We currently use .env for simd.info endpoints, so the --allow-package-env-file flag is required.
(when we publish it will be more straight forward)

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
- TODO: Replace temporary endpoints with simd.ai endpoints.

- When updating endpoints, modify:
    - simdAi.ts
    - config.ts

## License
- TODO: Add a proper license file to the repository/package.

## Project Structure

- extension.ts
    - Acts as the main entry point, responsible for activating all commands.

- syntaxHighlighting.ts
    - Contains the logic for intrinsics highlighting and tooltip hovers.

- config.ts
    - Handles logic related to API keys.

- ChatViewProvider.ts, ChatWebviewHtml.ts, and media/chat.html
    - Together provide the sidebar chat functionality.

- utils/
    - Utility functions to support chat sessions and message history.

- translation/
    - Implements the translation command logic for various architectures.

- api/
    - implements various fetches