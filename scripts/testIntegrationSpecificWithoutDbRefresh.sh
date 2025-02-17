#/usr/bin/env bash
. ./.env
docker_ip=$(docker inspect -f "{{ .NetworkSettings.IPAddress }}" $DB_CONTAINER_NAME_TEST)
if [ $? -eq 1 ]; then
  /usr/bin/env bash testHarness/setup_database.sh
elif [[ -z $(echo "$docker_ip" | tr -d '[:space:]') ]]; then
	echo "Recreating DB"
  /usr/bin/env bash testHarness/teardown_database.sh
  /usr/bin/env bash testHarness/setup_database.sh
else
  echo 'Docker is running already'
fi

/usr/bin/env RUNNING_UNIT_TESTS=1 mocha --loader=ts-node/esm -r dotenv/config -r src/infrastructure/orm/sqlize/mochaRootHook.ts -r src/infrastructure/orm/snowflake/mochaRootHook.ts $@;
