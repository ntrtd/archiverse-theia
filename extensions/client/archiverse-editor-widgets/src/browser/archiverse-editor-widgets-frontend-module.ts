import { ContainerModule } from '@theia/core/shared/inversify';

/**
 * Frontend module for the Archiverse Editor Widgets extension.
 */
export default new ContainerModule(bind => {
    bind; // Placeholder usage to satisfy TS6133
    // Bind editor widget contributions here

    console.log("Archiverse Editor Widgets Frontend Module Loaded");
});
