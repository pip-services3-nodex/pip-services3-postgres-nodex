const process = require('process');

import { ConfigParams } from 'pip-services3-commons-nodex';
import { DummyPersistenceFixture } from '../fixtures/DummyPersistenceFixture';
import { DummyPostgresPersistence } from './DummyPostgresPersistence';

suite('DummyPostgresPersistence', ()=> {
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

        persistence = new DummyPostgresPersistence();
        persistence.configure(dbConfig);

        fixture = new DummyPersistenceFixture(persistence);

        await persistence.open(null);
        await persistence.clear(null);
    });

    teardown(async () => {
        await persistence.close(null);
    });

    test('Crud Operations', async () => {
        await fixture.testCrudOperations();
    });

    test('Batch Operations', async () => {
        await fixture.testBatchOperations();
    });
});