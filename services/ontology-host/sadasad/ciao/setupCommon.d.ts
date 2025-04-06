import { LanguageClientConfig } from 'monaco-editor-wrapper';
export declare const defineUserServices: () => {
    userServices: {
        [x: string]: any;
    };
    debugLogging: boolean;
};
export declare const configureMonacoWorkers: () => void;
export declare const configureWorker: () => LanguageClientConfig;
//# sourceMappingURL=setupCommon.d.ts.map