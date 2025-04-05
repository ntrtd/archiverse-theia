import { ContainerModule } from '@theia/core/shared/inversify';

/**
 * Frontend module for the Archiverse Tools Client extension.
 */
export default new ContainerModule(bind => {
    bind; // Placeholder usage to satisfy TS6133
    // Bind tool UI contributions, commands, etc. here

    console.log("Archiverse Tools Client Frontend Module Loaded");
});
