/**
 * Register custom validation checks for runtime validation of Archiverse models (.archiverse files).
 */
export function registerValidationChecks(services) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.ArchiverseValidator;
    const checks = {
    // Add checks for specific runtime AstNode types here based on language rules
    // Example: Archimate_Business_Actor: validator.checkBusinessActorAssignments
    };
    // Register the checks if any are defined
    if (Object.keys(checks).length > 0) {
        registry.register(checks, validator);
    }
}
/**
 * Implementation of custom validations for Archiverse.
 */
export class ArchiverseValidator {
    constructor(services) {
        this.services = services;
    }
}
//# sourceMappingURL=archiverse-validator.js.map