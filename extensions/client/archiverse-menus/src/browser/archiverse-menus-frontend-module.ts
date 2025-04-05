import { ContainerModule } from '@theia/core/shared/inversify';
import { CommandContribution, MenuContribution } from '@theia/core/lib/common';
// Import your custom contributions
// import { ArchiverseMenuContribution } from './archiverse-menu-contribution';
// import { ArchiverseCommandContribution } from './archiverse-command-contribution';

/**
 * Frontend module for the Archiverse Menus extension.
 */
export default new ContainerModule(bind => {
    bind; // Placeholder usage to satisfy TS6133
    // Bind menu and command contributions here
    // bind(CommandContribution).to(ArchiverseCommandContribution);
    // bind(MenuContribution).to(ArchiverseMenuContribution);

    // Placeholder usage for imports to satisfy TS6192
    let _commandContribution: CommandContribution = undefined!;
    let _menuContribution: MenuContribution = undefined!;
    _commandContribution; _menuContribution; // Keep this to potentially satisfy strict unused variable checks if needed

    console.log("Archiverse Menus Frontend Module Loaded");
});
