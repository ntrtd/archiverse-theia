import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';
import { configureWorker, defineUserServices } from './setupCommon.js';
export const setupConfigExtended = () => {
    const extensionFilesOrContents = new Map();
    extensionFilesOrContents.set('/language-configuration.json', new URL('../language-configuration.json', import.meta.url));
    extensionFilesOrContents.set('/archiverse-grammar.json', new URL('../syntaxes/archiverse.tmLanguage.json', import.meta.url));
    return {
        wrapperConfig: {
            serviceConfig: defineUserServices(),
            editorAppConfig: {
                $type: 'extended',
                languageId: 'archiverse',
                code: `// Archiverse is running in the web!`,
                useDiffEditor: false,
                extensions: [{
                        config: {
                            name: 'archiverse-web',
                            publisher: 'generator-langium',
                            version: '1.0.0',
                            engines: {
                                vscode: '*'
                            },
                            contributes: {
                                languages: [{
                                        id: 'archiverse',
                                        extensions: [
                                            '.archiverse'
                                        ],
                                        configuration: './language-configuration.json'
                                    }],
                                grammars: [{
                                        language: 'archiverse',
                                        scopeName: 'source.archiverse',
                                        path: './archiverse-grammar.json'
                                    }]
                            }
                        },
                        filesOrContents: extensionFilesOrContents,
                    }],
                userConfiguration: {
                    json: JSON.stringify({
                        'workbench.colorTheme': 'Default Dark Modern',
                        'editor.semanticHighlighting.enabled': true
                    })
                }
            }
        },
        languageClientConfig: configureWorker()
    };
};
export const executeExtended = async (htmlElement) => {
    const userConfig = setupConfigExtended();
    const wrapper = new MonacoEditorLanguageClientWrapper();
    await wrapper.initAndStart(userConfig, htmlElement);
};
//# sourceMappingURL=setupExtended.js.map