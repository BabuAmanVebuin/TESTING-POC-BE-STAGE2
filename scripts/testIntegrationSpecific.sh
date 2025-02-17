#/usr/bin/env bash
/usr/bin/env bash testHarness/setup_database.sh && RUNNING_UNIT_TESTS=1 mocha --loader=ts-node/esm -r dotenv/config -r src/infrastructure/orm/sqlize/mochaRootHook.ts -r src/infrastructure/orm/snowflake/mochaRootHook.ts $@;
/usr/bin/env bash testHarness/teardown_database.sh;
