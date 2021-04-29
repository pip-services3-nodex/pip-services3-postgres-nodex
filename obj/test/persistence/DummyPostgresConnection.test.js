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
const process = require('process');
const assert = require('chai').assert;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_3 = require("pip-services3-commons-nodex");
const PostgresConnection_1 = require("../../src/connect/PostgresConnection");
const DummyPersistenceFixture_1 = require("../fixtures/DummyPersistenceFixture");
const DummyPostgresPersistence_1 = require("./DummyPostgresPersistence");
suite('DummyPostgresConnection', () => {
    let connection;
    let persistence;
    let fixture;
    let postgresUri = process.env['POSTGRES_URI'];
    let postgresHost = process.env['POSTGRES_HOST'] || 'localhost';
    let postgresPort = process.env['POSTGRES_PORT'] || 5432;
    let postgresDatabase = process.env['POSTGRES_DB'] || 'test';
    let postgresUser = process.env['POSTGRES_USER'] || 'postgres';
    let postgresPassword = process.env['POSTGRES_PASSWORD'] || 'postgres';
    if (postgresUri == null && postgresHost == null) {
        return;
    }
    setup(() => __awaiter(void 0, void 0, void 0, function* () {
        let dbConfig = pip_services3_commons_nodex_1.ConfigParams.fromTuples('connection.uri', postgresUri, 'connection.host', postgresHost, 'connection.port', postgresPort, 'connection.database', postgresDatabase, 'credential.username', postgresUser, 'credential.password', postgresPassword);
        connection = new PostgresConnection_1.PostgresConnection();
        connection.configure(dbConfig);
        persistence = new DummyPostgresPersistence_1.DummyPostgresPersistence();
        persistence.setReferences(pip_services3_commons_nodex_3.References.fromTuples(new pip_services3_commons_nodex_2.Descriptor("pip-services", "connection", "postgres", "default", "1.0"), connection));
        fixture = new DummyPersistenceFixture_1.DummyPersistenceFixture(persistence);
        yield connection.open(null);
        yield persistence.open(null);
        yield persistence.clear(null);
    }));
    teardown(() => __awaiter(void 0, void 0, void 0, function* () {
        yield connection.close(null);
        yield persistence.close(null);
    }));
    test('Connection', () => {
        assert.isObject(connection.getConnection());
        assert.isString(connection.getDatabaseName());
    });
    test('Crud Operations', () => __awaiter(void 0, void 0, void 0, function* () {
        yield fixture.testCrudOperations();
    }));
    test('Batch Operations', () => __awaiter(void 0, void 0, void 0, function* () {
        yield fixture.testBatchOperations();
    }));
});
//# sourceMappingURL=DummyPostgresConnection.test.js.map