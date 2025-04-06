import chalk from 'chalk';
import { exec } from 'child_process';
import util from 'util';
const execPromise = util.promisify(exec);
/**
 * Executes a shell command safely and logs output/errors.
 * @param command The command to execute.
 * @param description A description of the command for logging.
 */
export async function executeCommand(command, description) {
    var _a;
    console.log(chalk.blue(`Executing: ${description}`));
    console.log(chalk.gray(`  Command: ${command}`));
    try {
        const { stdout, stderr } = await execPromise(command);
        if (stderr) {
            console.warn(chalk.yellow(`  Stderr:\n${stderr}`));
        }
        if (stdout) {
            console.log(chalk.gray(`  Stdout:\n${stdout}`));
        }
        console.log(chalk.green(`  Successfully executed: ${description}`));
    }
    catch (error) {
        console.error(chalk.red(`\n  Error executing ${description}:`), (_a = error.message) !== null && _a !== void 0 ? _a : error);
        if (error.stderr) {
            console.error(chalk.red(`  Stderr:\n${error.stderr}`));
        }
        if (error.stdout) {
            console.error(chalk.red(`  Stdout:\n${error.stdout}`));
        }
        throw new Error(`Command failed: ${description}`);
    }
}
// Add other utility functions as needed, e.g., findToolInPath
//# sourceMappingURL=utils.js.map