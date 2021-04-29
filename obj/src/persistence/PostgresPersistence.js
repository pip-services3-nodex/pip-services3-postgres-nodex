"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresPersistence = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_3 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_4 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_5 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_6 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_7 = require("pip-services3-commons-nodex");
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
const PostgresConnection_1 = require("../connect/PostgresConnection");
/**
 * Abstract persistence component that stores data in PostgreSQL using plain driver.
 *
 * This is the most basic persistence component that is only
 * able to store data items of any type. Specific CRUD operations
 * over the data items must be implemented in child classes by
 * accessing <code>this._db</code> or <code>this._collection</code> properties.
 *
 * ### Configuration parameters ###
 *
 * - collection:                  (optional) PostgreSQL collection name
 * - connection(s):
 *   - discovery_key:             (optional) a key to retrieve the connection from [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/connect.idiscovery.html IDiscovery]]
 *   - host:                      host name or IP address
 *   - port:                      port number (default: 27017)
 *   - uri:                       resource URI or connection string with all parameters in it
 * - credential(s):
 *   - store_key:                 (optional) a key to retrieve the credentials from [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/auth.icredentialstore.html ICredentialStore]]
 *   - username:                  (optional) user name
 *   - password:                  (optional) user password
 * - options:
 *   - connect_timeout:      (optional) number of milliseconds to wait before timing out when connecting a new client (default: 0)
 *   - idle_timeout:         (optional) number of milliseconds a client must sit idle in the pool and not be checked out (default: 10000)
 *   - max_pool_size:        (optional) maximum number of clients the pool should contain (default: 10)
 *
 * ### References ###
 *
 * - <code>\*:logger:\*:\*:1.0</code>           (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/log.ilogger.html ILogger]] components to pass log messages
 * - <code>\*:discovery:\*:\*:1.0</code>        (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/connect.idiscovery.html IDiscovery]] services
 * - <code>\*:credential-store:\*:\*:1.0</code> (optional) Credential stores to resolve credentials
 *
 * ### Example ###
 *
 *     class MyPostgresPersistence extends PostgresPersistence<MyData> {
 *
 *       public constructor() {
 *           base("mydata");
 *       }
 *
 *       public getByName(correlationId: string, name: string): Promise<MyData> {
 *         let criteria = { name: name };
 *         return new Promise((resolve, reject) => {
 *           this._model.findOne(criteria, (err, item) => {
 *             if (err != null) {
 *               reject(err);
 *               return;
 *             }
 *
 *             item = this.convertToPublic(item);
 *             resolve(item);
 *           });
 *          });
 *       });
 *
 *       public set(correlatonId: string, item: MyData): Promise<MyData> {
 *         let criteria = { name: item.name };
 *         let options = { upsert: true, new: true };
 *         return new Promise((resolve, reject) => {
 *           this.findOneAndUpdate(criteria, item, options, (err, item) => {
 *             if (err != null) {
 *               reject(err);
 *               return;
 *             }
 *
 *             item = this.convertToPublic(item);
 *             resolve(item);
 *           });
 *          });
 *       }
 *
 *     }
 *
 *     let persistence = new MyPostgresPersistence();
 *     persistence.configure(ConfigParams.fromTuples(
 *         "host", "localhost",
 *         "port", 27017
 *     ));
 *
 *     await persitence.open("123");
 *
 *     let item = await persistence.set("123", { name: "ABC" });
 *     item = await persistence.getByName("123", "ABC");
 *     console.log(item);   // Result: { name: "ABC" }
 */
class PostgresPersistence {
    /**
     * Creates a new instance of the persistence component.
     *
     * @param tableName    (optional) a table name.
     */
    constructor(tableName) {
        this._schemaStatements = [];
        /**
         * The dependency resolver.
         */
        this._dependencyResolver = new pip_services3_commons_nodex_6.DependencyResolver(PostgresPersistence._defaultConfig);
        /**
         * The logger.
         */
        this._logger = new pip_services3_components_nodex_1.CompositeLogger();
        this._maxPageSize = 100;
        this._tableName = tableName;
    }
    /**
     * Configures component by passing configuration parameters.
     *
     * @param config    configuration parameters to be set.
     */
    configure(config) {
        config = config.setDefaults(PostgresPersistence._defaultConfig);
        this._config = config;
        this._dependencyResolver.configure(config);
        this._maxPageSize = config.getAsIntegerWithDefault("options.max_page_size", this._maxPageSize);
        this._tableName = config.getAsStringWithDefault("collection", this._tableName);
        this._tableName = config.getAsStringWithDefault("table", this._tableName);
    }
    /**
     * Sets references to dependent components.
     *
     * @param references 	references to locate the component dependencies.
     */
    setReferences(references) {
        this._references = references;
        this._logger.setReferences(references);
        // Get connection
        this._dependencyResolver.setReferences(references);
        this._connection = this._dependencyResolver.getOneOptional('connection');
        // Or create a local one
        if (this._connection == null) {
            this._connection = this.createConnection();
            this._localConnection = true;
        }
        else {
            this._localConnection = false;
        }
    }
    /**
     * Unsets (clears) previously set references to dependent components.
     */
    unsetReferences() {
        this._connection = null;
    }
    createConnection() {
        let connection = new PostgresConnection_1.PostgresConnection();
        if (this._config)
            connection.configure(this._config);
        if (this._references)
            connection.setReferences(this._references);
        return connection;
    }
    /**
     * Adds index definition to create it on opening
     * @param keys index keys (fields)
     * @param options index options
     */
    ensureIndex(name, keys, options) {
        let builder = "CREATE";
        options = options || {};
        if (options.unique) {
            builder += " UNIQUE";
        }
        builder += " INDEX IF NOT EXISTS " + this.quoteIdentifier(name) + " ON " + this.quoteIdentifier(this._tableName);
        if (options.type) {
            builder += " " + options.type;
        }
        let fields = "";
        for (let key in keys) {
            if (fields != "")
                fields += ", ";
            fields += key;
            let asc = keys[key];
            if (!asc)
                fields += " DESC";
        }
        builder += " (" + fields + ")";
        this.ensureSchema(builder);
    }
    /**
     * Adds a statement to schema definition
     * @param schemaStatement a statement to be added to the schema
     */
    ensureSchema(schemaStatement) {
        this._schemaStatements.push(schemaStatement);
    }
    /**
     * Clears all auto-created objects
     */
    clearSchema() {
        this._schemaStatements = [];
    }
    /**
     * Defines database schema via auto create objects or convenience methods.
     */
    defineSchema() {
        // Todo: override in chile classes
    }
    /**
     * Converts object value from internal to public format.
     *
     * @param value     an object in internal format to convert.
     * @returns converted object in public format.
     */
    convertToPublic(value) {
        return value;
    }
    /**
     * Convert object value from public to internal format.
     *
     * @param value     an object in public format to convert.
     * @returns converted object in internal format.
     */
    convertFromPublic(value) {
        return value;
    }
    quoteIdentifier(value) {
        if (value == null || value == "")
            return value;
        if (value[0] == '"')
            return value;
        return '"' + value + '"';
    }
    /**
     * Checks if the component is opened.
     *
     * @returns true if the component has been opened and false otherwise.
     */
    isOpen() {
        return this._opened;
    }
    /**
     * Opens the component.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    open(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._opened) {
                return;
            }
            if (this._connection == null) {
                this._connection = this.createConnection();
                this._localConnection = true;
            }
            if (this._localConnection) {
                yield this._connection.open(correlationId);
            }
            if (this._connection == null) {
                throw new pip_services3_commons_nodex_5.InvalidStateException(correlationId, 'NO_CONNECTION', 'PostgreSQL connection is missing');
            }
            if (!this._connection.isOpen()) {
                throw new pip_services3_commons_nodex_4.ConnectionException(correlationId, "CONNECT_FAILED", "PostgreSQL connection is not opened");
            }
            this._opened = false;
            this._client = this._connection.getConnection();
            this._databaseName = this._connection.getDatabaseName();
            // Define database schema
            this.defineSchema();
            // Recreate objects
            yield this.createSchema(correlationId);
            this._opened = true;
            this._logger.debug(correlationId, "Connected to postgres database %s, collection %s", this._databaseName, this.quoteIdentifier(this._tableName));
        });
    }
    /**
     * Closes component and frees used resources.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    close(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._opened) {
                return;
            }
            if (this._connection == null) {
                throw new pip_services3_commons_nodex_5.InvalidStateException(correlationId, 'NO_CONNECTION', 'Postgres connection is missing');
            }
            if (this._localConnection) {
                yield this._connection.close(correlationId);
            }
            this._opened = false;
            this._client = null;
        });
    }
    /**
     * Clears component state.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    clear(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Return error if collection is not set
            if (this._tableName == null) {
                throw new Error('Table name is not defined');
            }
            let query = "DELETE FROM " + this.quoteIdentifier(this._tableName);
            return new Promise((resolve, reject) => {
                this._client.query(query, (err, result) => {
                    if (err) {
                        err = new pip_services3_commons_nodex_4.ConnectionException(correlationId, "CONNECT_FAILED", "Connection to postgres failed").withCause(err);
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
        });
    }
    createSchema(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._schemaStatements == null || this._schemaStatements.length == 0) {
                return null;
            }
            // Check if table exist to determine weither to auto create objects
            let query = "SELECT to_regclass('" + this._tableName + "')";
            let exist = yield new Promise((resolve, reject) => {
                this._client.query(query, (err, result) => {
                    if (err != null) {
                        reject(err);
                        return;
                    }
                    let exist = result != null && result.rows
                        && result.rows.length > 0 && result.rows[0].to_regclass != null;
                    resolve(exist);
                });
            });
            if (exist) {
                return;
            }
            this._logger.debug(correlationId, 'Table ' + this._tableName + ' does not exist. Creating database objects...');
            try {
                // Run all DML commands
                for (let dml of this._schemaStatements) {
                    yield new Promise((resolve, reject) => {
                        this._client.query(dml, (err, result) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                            resolve();
                        });
                    });
                }
            }
            catch (ex) {
                this._logger.error(correlationId, ex, 'Failed to autocreate database object');
                throw ex;
            }
        });
    }
    /**
     * Generates a list of column names to use in SQL statements like: "column1,column2,column3"
     * @param values an array with column values or a key-value map
     * @returns a generated list of column names
     */
    generateColumns(values) {
        values = !Array.isArray(values) ? Object.keys(values) : values;
        let result = "";
        for (let value of values) {
            if (result != "")
                result += ",";
            result += this.quoteIdentifier(value);
        }
        return result;
    }
    /**
     * Generates a list of value parameters to use in SQL statements like: "$1,$2,$3"
     * @param values an array with values or a key-value map
     * @returns a generated list of value parameters
     */
    generateParameters(values) {
        values = !Array.isArray(values) ? Object.keys(values) : values;
        let index = 1;
        let result = "";
        for (let value of values) {
            if (result != "")
                result += ",";
            result += "$" + index;
            index++;
        }
        return result;
    }
    /**
     * Generates a list of column sets to use in UPDATE statements like: column1=$1,column2=$2
     * @param values a key-value map with columns and values
     * @returns a generated list of column sets
     */
    generateSetParameters(values) {
        let result = "";
        let index = 1;
        for (let column in values) {
            if (result != "")
                result += ",";
            result += this.quoteIdentifier(column) + "=$" + index;
            index++;
        }
        return result;
    }
    /**
     * Generates a list of column parameters
     * @param values a key-value map with columns and values
     * @returns a generated list of column values
     */
    generateValues(values) {
        return Object.values(values);
    }
    /**
     * Gets a page of data items retrieved by a given filter and sorted according to sort parameters.
     *
     * This method shall be called by a public getPageByFilter method from child class that
     * receives FilterParams and converts them into a filter function.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param filter            (optional) a filter JSON object
     * @param paging            (optional) paging parameters
     * @param sort              (optional) sorting JSON object
     * @param select            (optional) projection JSON object
     * @returns                 the requested data page
     */
    getPageByFilter(correlationId, filter, paging, sort, select) {
        return __awaiter(this, void 0, void 0, function* () {
            select = select != null ? select : "*";
            let query = "SELECT " + select + " FROM " + this.quoteIdentifier(this._tableName);
            // Adjust max item count based on configuration
            paging = paging || new pip_services3_commons_nodex_2.PagingParams();
            let skip = paging.getSkip(-1);
            let take = paging.getTake(this._maxPageSize);
            let pagingEnabled = paging.total;
            if (filter && filter != "") {
                query += " WHERE " + filter;
            }
            if (sort != null) {
                query += " ORDER BY " + sort;
            }
            if (skip >= 0) {
                query += " OFFSET " + skip;
            }
            query += " LIMIT " + take;
            let items = yield new Promise((resolve, reject) => {
                this._client.query(query, (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result.rows);
                });
            });
            if (items != null) {
                this._logger.trace(correlationId, "Retrieved %d from %s", items.length, this._tableName);
            }
            items = items.map(this.convertToPublic);
            if (pagingEnabled) {
                let query = 'SELECT COUNT(*) AS count FROM ' + this.quoteIdentifier(this._tableName);
                if (filter != null && filter != "") {
                    query += " WHERE " + filter;
                }
                let count = yield new Promise((resolve, reject) => {
                    this._client.query(query, (err, result) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        let count = result.rows && result.rows.length == 1
                            ? pip_services3_commons_nodex_7.LongConverter.toLong(result.rows[0].count) : 0;
                        resolve(count);
                    });
                });
                return new pip_services3_commons_nodex_3.DataPage(items, count);
            }
            else {
                return new pip_services3_commons_nodex_3.DataPage(items);
            }
        });
    }
    /**
     * Gets a number of data items retrieved by a given filter.
     *
     * This method shall be called by a public getCountByFilter method from child class that
     * receives FilterParams and converts them into a filter function.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param filter            (optional) a filter JSON object
     * @returns                 a number of items that satisfy the filter.
     */
    getCountByFilter(correlationId, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = 'SELECT COUNT(*) AS count FROM ' + this.quoteIdentifier(this._tableName);
            if (filter && filter != "") {
                query += " WHERE " + filter;
            }
            let count = yield new Promise((resolve, reject) => {
                this._client.query(query, (err, result) => {
                    if (err != null) {
                        reject(err);
                        return;
                    }
                    let count = result.rows && result.rows.length == 1
                        ? pip_services3_commons_nodex_7.LongConverter.toLong(result.rows[0].count) : 0;
                    resolve(count);
                });
            });
            this._logger.trace(correlationId, "Counted %d items in %s", count, this._tableName);
            return count;
        });
    }
    /**
     * Gets a list of data items retrieved by a given filter and sorted according to sort parameters.
     *
     * This method shall be called by a public getListByFilter method from child class that
     * receives FilterParams and converts them into a filter function.
     *
     * @param correlationId    (optional) transaction id to trace execution through call chain.
     * @param filter           (optional) a filter JSON object
     * @param paging           (optional) paging parameters
     * @param sort             (optional) sorting JSON object
     * @param select           (optional) projection JSON object
     * @returns                a list with requested data items.
     */
    getListByFilter(correlationId, filter, sort, select) {
        return __awaiter(this, void 0, void 0, function* () {
            select = select != null ? select : "*";
            let query = "SELECT " + select + " FROM " + this.quoteIdentifier(this._tableName);
            if (filter != null) {
                query += " WHERE " + filter;
            }
            if (sort != null) {
                query += " ORDER BY " + sort;
            }
            let items = yield new Promise((resolve, reject) => {
                this._client.query(query, (err, result) => {
                    if (err != null) {
                        reject(err);
                        return;
                    }
                    let items = result.rows;
                    resolve(items);
                });
            });
            this._logger.trace(correlationId, "Retrieved %d from %s", items.length, this._tableName);
            items = items.map(this.convertToPublic);
            return items;
        });
    }
    /**
     * Gets a random item from items that match to a given filter.
     *
     * This method shall be called by a public getOneRandom method from child class that
     * receives FilterParams and converts them into a filter function.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param filter            (optional) a filter JSON object
     * @returns                 a random item that satisfies the filter.
     */
    getOneRandom(correlationId, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = 'SELECT COUNT(*) AS count FROM ' + this.quoteIdentifier(this._tableName);
            if (filter != null) {
                query += " WHERE " + filter;
            }
            let count = yield new Promise((resolve, reject) => {
                this._client.query(query, (err, result) => {
                    if (err != null) {
                        reject(err);
                        return;
                    }
                    let count = result.rows && result.rows.length == 1 ? result.rows[0].count : 0;
                    resolve(count);
                });
            });
            query = "SELECT * FROM " + this.quoteIdentifier(this._tableName);
            if (filter != null) {
                query += " WHERE " + filter;
            }
            let pos = Math.trunc(Math.random() * count);
            query += " OFFSET " + pos + " LIMIT 1";
            let item = yield new Promise((resolve, reject) => {
                this._client.query(query, (err, result) => {
                    if (err != null) {
                        reject(err);
                        return;
                    }
                    let items = result.rows;
                    let item = (items != null && items.length > 0) ? items[0] : null;
                    resolve(item);
                });
            });
            if (item == null) {
                this._logger.trace(correlationId, "Random item wasn't found from %s", this._tableName);
            }
            else {
                this._logger.trace(correlationId, "Retrieved random item from %s", this._tableName);
            }
            item = this.convertToPublic(item);
            return item;
        });
    }
    /**
     * Creates a data item.
     *
     * @param correlation_id    (optional) transaction id to trace execution through call chain.
     * @param item              an item to be created.
     * @returns                 the created item.
     */
    create(correlationId, item) {
        return __awaiter(this, void 0, void 0, function* () {
            if (item == null) {
                return;
            }
            let row = this.convertFromPublic(item);
            let columns = this.generateColumns(row);
            let params = this.generateParameters(row);
            let values = this.generateValues(row);
            let query = "INSERT INTO " + this.quoteIdentifier(this._tableName)
                + " (" + columns + ") VALUES (" + params + ") RETURNING *";
            let newItem = yield new Promise((resolve, reject) => {
                this._client.query(query, values, (err, result) => {
                    if (err != null) {
                        reject(err);
                        return;
                    }
                    let item = result && result.rows && result.rows.length == 1
                        ? result.rows[0] : null;
                    resolve(item);
                });
            });
            this._logger.trace(correlationId, "Created in %s with id = %s", this._tableName, row.id);
            newItem = this.convertToPublic(newItem);
            return newItem;
        });
    }
    /**
     * Deletes data items that match to a given filter.
     *
     * This method shall be called by a public deleteByFilter method from child class that
     * receives FilterParams and converts them into a filter function.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param filter            (optional) a filter JSON object.
     */
    deleteByFilter(correlationId, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = "DELETE FROM " + this.quoteIdentifier(this._tableName);
            if (filter != null && filter != "") {
                query += " WHERE " + filter;
            }
            let count = yield new Promise((resolve, reject) => {
                this._client.query(query, (err, result) => {
                    if (err != null) {
                        reject(err);
                        return;
                    }
                    let count = result ? result.rowCount : 0;
                    resolve(count);
                });
            });
            this._logger.trace(correlationId, "Deleted %d items from %s", count, this._tableName);
        });
    }
}
exports.PostgresPersistence = PostgresPersistence;
PostgresPersistence._defaultConfig = pip_services3_commons_nodex_1.ConfigParams.fromTuples("collection", null, "dependencies.connection", "*:connection:postgres:*:1.0", 
// connections.*
// credential.*
"options.max_pool_size", 2, "options.keep_alive", 1, "options.connect_timeout", 5000, "options.auto_reconnect", true, "options.max_page_size", 100, "options.debug", true);
//# sourceMappingURL=PostgresPersistence.js.map