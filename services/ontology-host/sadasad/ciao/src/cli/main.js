// The following imports are commented out as they're not currently used
// import type { ArchimateModel } from '../language/generated/ast.js';
// import chalk from 'chalk';
import { Command } from 'commander';
import { ArchiverseLanguageMetaData } from '../language/generated/module.js';
// import { createArchiverseServices } from '../language/archiverse-module.js';
// import { extractAstNode } from './cli-util.js';
// import { generateJavaScript } from './generator.js';
// import { NodeFileSystem } from 'langium/node';
import * as url from 'node:url';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const packagePath = path.resolve(__dirname, '..', '..', 'package.json');
const packageContent = await fs.readFile(packagePath, 'utf-8');
/**
 * Generation action handler - currently stubbed out
 * Original implementation is commented out as it's not currently in use
 * Would be responsible for generating JavaScript from ArchiMate models
 */
export const generateAction = async (fileName, opts) => {
    // Implementation is commented out as the feature is not currently active
    // To re-enable, uncomment both the imports above and the implementation below
    // const services = createArchiverseServices(NodeFileSystem).Archiverse;
    // const model = await extractAstNode<ArchimateModel>(fileName, services);
    // const generatedFilePath = generateJavaScript(model, fileName, opts.destination);
    // console.log(chalk.green(`JavaScript code generated successfully: ${generatedFilePath}`));
    console.log(`Generation requested for file: ${fileName} (feature not currently active)`);
};
/**
 * Main CLI configuration function
 * Sets up the command-line interface for the Archiverse tool
 */
export default function () {
    const program = new Command();
    program.version(JSON.parse(packageContent).version);
    const fileExtensions = ArchiverseLanguageMetaData.fileExtensions.join(', ');
    program
        .command('generate')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .option('-d, --destination <dir>', 'destination directory of generating')
        .description('generates JavaScript code that represents an ArchiMate model with business elements')
        .action(generateAction);
    program.parse(process.argv);
}
//# sourceMappingURL=main.js.map