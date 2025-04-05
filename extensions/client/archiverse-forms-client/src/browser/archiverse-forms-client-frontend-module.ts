import { ContainerModule } from '@theia/core/shared/inversify';

/**
 * Frontend module for the Archiverse Forms Client extension.
 */
export default new ContainerModule(bind => {
    bind; // Placeholder usage to satisfy TS6133
    // Bind form contributions, views, or editors here

    console.log("Archiverse Forms Client Frontend Module Loaded");
});
