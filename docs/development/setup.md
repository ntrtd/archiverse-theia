# Development Setup

This guide explains how to set up your environment to develop the Archiverse Theia application.

## Prerequisites

*   **Git:** For cloning the repository and managing submodules.
*   **Node.js:** Version 18 or higher (LTS recommended). Use [nvm](https://github.com/nvm-sh/nvm) or similar to manage Node versions.
*   **Yarn:** Version 1.x (Classic). Install via `npm install -g yarn`.
*   **(Optional) Python & Build Tools:** Required for building native Node.js modules used by some Theia extensions. On macOS, installing Xcode Command Line Tools (`xcode-select --install`) is usually sufficient. On other systems, consult Node.js/`node-gyp` documentation. Ensure `setuptools` is installed for your Python version if using Python 3.12+ (`pip install setuptools`).

## Setup Steps

1.  **Clone the Repository:**
    ```bash
    git clone <repository-url> archiverse-theia
    cd archiverse-theia
    ```

2.  **Initialize Submodules:** Fetch the code for all included submodules.
    ```bash
    git submodule update --init --recursive
    ```
    *(Note: `--recursive` might be needed if submodules themselves have submodules, though not currently expected for our direct dependencies).*

3.  **Install Dependencies:** Install dependencies for the main application shell and all workspaces (including extensions eventually).
    ```bash
    yarn install
    ```
    *(This uses Yarn Workspaces and Lerna to link local packages).*

## Running the Application

1.  **Start the Electron App:**
    ```bash
    yarn start:electron
    ```
    This command performs several steps defined in the root `package.json`:
    *   Installs dependencies for the `archiverse-archie` submodule (`yarn --cwd submodules/archiverse-archie install`).
    *   Runs the Langium generator within the submodule (`yarn --cwd submodules/archiverse-archie langium:generate`).
    *   Builds the `archiverse-archie` submodule (`yarn --cwd submodules/archiverse-archie build`).
    *   Builds the Electron application shell (`yarn build:electron`).
    *   Starts the Electron application, opening the current directory (`../` relative to `electron-app`) as the workspace (`yarn --cwd electron-app start ../`).

2.  **Start the Browser App (Alternative):**
    ```bash
    yarn start:browser
    ```
    *(Note: The browser app currently lacks the specific build steps for the `archiverse-archie` submodule included in `start:electron`. It also won't use the graph VFS unless specifically configured).*

## Building for Production

*(Details TBD - typically involves running build scripts with production flags)*

## Watching for Changes

*(Details TBD - typically involves running `watch` scripts defined in package.json files)*
