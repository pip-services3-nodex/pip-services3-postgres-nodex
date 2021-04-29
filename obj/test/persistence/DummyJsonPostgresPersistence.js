"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DummyJsonPostgresPersistence = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const IdentifiableJsonPostgresPersistence_1 = require("../../src/persistence/IdentifiableJsonPostgresPersistence");
class DummyJsonPostgresPersistence extends IdentifiableJsonPostgresPersistence_1.IdentifiableJsonPostgresPersistence {
    constructor() {
        super('dummies_json');
    }
    defineSchema() {
        this.clearSchema();
        this.ensureTable();
        this.ensureIndex(this._tableName + '_json_key', { "(data->>'key')": 1 }, { unique: true });
    }
    getPageByFilter(correlationId, filter, paging) {
        filter = filter || new pip_services3_commons_nodex_1.FilterParams();
        let key = filter.getAsNullableString('key');
        let filterCondition = "";
        if (key != null)
            filterCondition += "data->>'key'='" + key + "'";
        return super.getPageByFilter(correlationId, filterCondition, paging, null, null);
    }
    getCountByFilter(correlationId, filter) {
        filter = filter || new pip_services3_commons_nodex_1.FilterParams();
        let key = filter.getAsNullableString('key');
        let filterCondition = "";
        if (key != null)
            filterCondition += "data->>'key'='" + key + "'";
        return super.getCountByFilter(correlationId, filterCondition);
    }
}
exports.DummyJsonPostgresPersistence = DummyJsonPostgresPersistence;
//# sourceMappingURL=DummyJsonPostgresPersistence.js.map