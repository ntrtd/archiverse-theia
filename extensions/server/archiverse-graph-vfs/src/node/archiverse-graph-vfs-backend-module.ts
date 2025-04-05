import { ContainerModule } from '@theia/core/shared/inversify';
// Temporarily remove filesystem imports to test build
// import { FileSystem, FileSystemProvider } from '@theia/filesystem/lib/node/node-filesystem';
// Import your custom VFS provider
// import { GraphFileSystemProvider } from './graph-filesystem-provider';

/**
 * Backend module for the Archiverse Graph VFS extension.
 */
export default new ContainerModule(bind => {
    bind; // Placeholder usage to satisfy TS6133
    // Bind and register the custom FileSystemProvider here
    // bind(GraphFileSystemProvider).toSelf().inSingletonScope();
    // bind(FileSystemProvider).toService(GraphFileSystemProvider);

    // Placeholder usage for imports (removed filesystem types)
    // let _fsProvider: FileSystemProvider;
    // let _fs: FileSystem;
    // _fsProvider; _fs;

    console.log("Archiverse Graph VFS Backend Module Loaded");

    // Example: Registering for a specific scheme (needs GraphFileSystemProvider to be bound)
    // const provider = bind(GraphFileSystemProvider).toSelf().inSingletonScope().get<GraphFileSystemProvider>(GraphFileSystemProvider);
    // const fileSystem = bind(FileSystem).toSelf().inSingletonScope().get<FileSystem>(FileSystem);
    // fileSystem.registerProvider('graphdb', provider); // Register for 'graphdb://' URIs
});
