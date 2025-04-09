# archiverse-theia
The example of how to build the Theia-based applications with the archiverse-theia.

## Getting started

Please install all necessary [prerequisites](https://github.com/eclipse-theia/theia/blob/master/doc/Developing.md#prerequisites).

## Running the browser example

    yarn build:browser
    yarn start:browser

*or:*

    yarn build:browser
    cd hosts/browser-app
    yarn start

*or:* launch `Start Browser Backend` configuration from VS code.

Open http://localhost:3000 in the browser.

## Running the Electron example

    yarn build:electron
    yarn start:electron

*or:*

    yarn build:electron
    cd hosts/electron-app
    yarn start

*or:* launch `Start Electron Backend` configuration from VS code.


## Developing with the browser example

Start watching all packages, including `browser-app`, of your application with

    yarn watch:browser

*or* watch only specific packages with

    cd archiverse-theia
    yarn watch

and the browser example.

    cd hosts/browser-app
    yarn watch

Run the example as [described above](#Running-the-browser-example)
## Developing with the Electron example

Start watching all packages, including `electron-app`, of your application with

    yarn watch:electron

*or* watch only specific packages with

    cd archiverse-theia
    yarn watch

and the Electron example.

    cd hosts/electron-app
    yarn watch

Run the example as [described above](#Running-the-Electron-example)

## Publishing archiverse-theia

Create a npm user and login to the npm registry, [more on npm publishing](https://docs.npmjs.com/getting-started/publishing-npm-packages).

    npm login

Publish packages with lerna to update versions properly across local packages, [more on publishing with lerna](https://github.com/lerna/lerna#publish).

    npx lerna publish
