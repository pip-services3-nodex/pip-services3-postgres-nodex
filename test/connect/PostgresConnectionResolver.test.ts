const assert = require('chai').assert;

import { ConfigParams } from 'pip-services3-commons-nodex';
import { PostgresConnectionResolver } from '../../src/connect/PostgresConnectionResolver';

suite('PostgresConnectionResolver', ()=> {

    test('Connection Config', async () => {
        let dbConfig = ConfigParams.fromTuples(
            'connection.host', 'localhost',
            'connection.port', 5432,
            'connection.database', 'test',
            'connection.ssl', true,
            'credential.username', 'postgres',
            'credential.password', 'postgres',
        );

        let resolver = new PostgresConnectionResolver();
        resolver.configure(dbConfig);

        let config = await resolver.resolve(null);
        assert.isObject(config);
        assert.equal('localhost', config.host);
        assert.equal(5432, config.port);
        assert.equal('test', config.database);
        assert.equal('postgres', config.user);
        assert.equal('postgres', config.password);
        assert.isUndefined(config.ssl);
    });
});