/**
 * Generation action handler - currently stubbed out
 * Original implementation is commented out as it's not currently in use
 * Would be responsible for generating JavaScript from ArchiMate models
 */
export declare const generateAction: (fileName: string, opts: GenerateOptions) => Promise<void>;
/**
 * Options for the generate command
 */
export type GenerateOptions = {
    destination?: string;
};
/**
 * Main CLI configuration function
 * Sets up the command-line interface for the Archiverse tool
 */
export default function (): void;
//# sourceMappingURL=main.d.ts.map