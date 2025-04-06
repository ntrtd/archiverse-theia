import { createArchiverseServices } from './archiverse-module.js';
import { startLanguageServer } from 'langium/lsp';
import { NodeFileSystem } from 'langium/node';
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node.js';
// Create a connection to the client
const connection = createConnection(ProposedFeatures.all);
// Inject the shared services and language-specific services
const { shared, Archiverse } = createArchiverseServices(Object.assign({ connection }, NodeFileSystem));
// Start the language server with the services
startLanguageServer(shared);
export const services = { archiverse: Archiverse };
//# sourceMappingURL=main.js.map