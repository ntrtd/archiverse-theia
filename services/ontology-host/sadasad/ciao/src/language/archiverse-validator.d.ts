import type { ArchiverseServices } from './archiverse-module.js';
/**
 * Register custom validation checks for runtime validation of Archiverse models (.archiverse files).
 */
export declare function registerValidationChecks(services: ArchiverseServices): void;
/**
 * Implementation of custom validations for Archiverse.
 */
export declare class ArchiverseValidator {
    protected readonly services: ArchiverseServices;
    constructor(services: ArchiverseServices);
}
//# sourceMappingURL=archiverse-validator.d.ts.map