"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultPostgresFactory = void 0;
/** @module build */
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const PostgresConnection_1 = require("../connect/PostgresConnection");
/**
 * Creates Postgres components by their descriptors.
 *
 * @see [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/classes/build.factory.html Factory]]
 * @see [[PostgresConnection]]
 */
class DefaultPostgresFactory extends pip_services3_components_nodex_1.Factory {
    /**
     * Create a new instance of the factory.
     */
    constructor() {
        super();
        this.registerAsType(DefaultPostgresFactory.PostgresConnectionDescriptor, PostgresConnection_1.PostgresConnection);
    }
}
exports.DefaultPostgresFactory = DefaultPostgresFactory;
DefaultPostgresFactory.PostgresConnectionDescriptor = new pip_services3_commons_nodex_1.Descriptor("pip-services", "connection", "postgres", "*", "1.0");
//# sourceMappingURL=DefaultPostgresFactory.js.map