const process = require('process');
const assert = require('chai').assert;

import { ConfigParams } from 'pip-services3-commons-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';
import { References } from 'pip-services3-commons-nodex';
import { PostgresConnection } from '../../src/connect/PostgresConnection';
import { DummyPersistenceFixture } from '../fixtures/DummyPersistenceFixture';
import { DummyPostgresPersistence } from './DummyPostgresPersistence';

suite('DummyPostgresConnection', ()=> {
    let connection: PostgresConnection;
    let persistence: DummyPostgresPersistence;
    let fixture: DummyPersistenceFixture;

    let postgresUri = process.env['POSTGRES_URI'];
    let postgresHost = process.env['POSTGRES_HOST'] || 'localhost';
    let postgresPort = process.env['POSTGRES_PORT'] || 5432;
    let postgresDatabase = process.env['POSTGRES_DB'] || 'test';
    let postgresUser = process.env['POSTGRES_USER'] || 'postgres';
    let postgresPassword = process.env['POSTGRES_PASSWORD'] || 'postgres';

    if (postgresUri == null && postgresHost == null) {
        return;
    }

    setup(async () => {
        let dbConfig = ConfigParams.fromTuples(
            'connection.uri', postgresUri,
            'connection.host', postgresHost,
            'connection.port', postgresPort,
            'connection.database', postgresDatabase,
            'credential.username', postgresUser,
            'credential.password', postgresPassword
        );

        connection = new PostgresConnection();
        connection.configure(dbConfig);

        persistence = new DummyPostgresPersistence();
        persistence.setReferences(References.fromTuples(
            new Descriptor("pip-services", "connection", "postgres", "default", "1.0"), connection
        ));

        fixture = new DummyPersistenceFixture(persistence);

        await connection.open(null);
        await persistence.open(null);
        await persistence.clear(null);
    });

    teardown(async () => {
        await connection.close(null);
        await persistence.close(null);
    });

    test('Connection', () => {
        assert.isObject(connection.getConnection());
        assert.isString(connection.getDatabaseName());
    });

    test('Crud Operations', async () => {
        await fixture.testCrudOperations();
    });

    test('Batch Operations', async () => {
        await fixture.testBatchOperations();
    });
});