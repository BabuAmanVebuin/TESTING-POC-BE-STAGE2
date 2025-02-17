#!/usr/bin/env bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
echo "SCRIPT_DIR=${SCRIPT_DIR}"
cd "${SCRIPT_DIR}/.."

if [ ! -f ./.env ]
  then
    echo ".env file not found. You may want to copy .env.example to .env first, and then customize .env."
    exit 1;
fi

. ./.env

echo "DB_HOST: $DB_HOST"
echo "DB_HOST_TEST: $DB_HOST_TEST"
echo "CMN_DB_HOST: $CMN_DB_HOST"
echo "CMN_DB_HOST_TEST: $CMN_DB_HOST_TEST"
if [ "$DB_HOST_TEST" != 'localhost' ] || [ "$CMN_DB_HOST_TEST" != 'localhost' ]
  then
    echo "For safety reasons, this script can be run only when DB_HOST_TEST and CMN_DB_HOST_TEST is 'localhost'."
    echo "Please make sure you are using the correct values in your .env file.";
    exit 2;
fi

echo Rebuilding MySQL Image from scratch.

# Build the base image
docker pull mysql:8.0.15

echo PTM database setup started.
docker stop $DB_CONTAINER_NAME_TEST
docker rm $DB_CONTAINER_NAME_TEST
docker run -p 127.0.0.1:$DB_PORT_TEST:3306 -p 127.0.0.1:${DB_PORT_TEST}0:33060 --detach --name=$DB_CONTAINER_NAME_TEST --env="MYSQL_ROOT_PASSWORD=$DB_PWD_TEST" mysql:8.0.15 --default-time-zone="+09:00" --lower-case-table-names
docker logs $DB_CONTAINER_NAME_TEST
docker inspect $DB_CONTAINER_NAME_TEST | grep "IPAddress"
docker_ip=$(docker inspect -f "{{ .NetworkSettings.IPAddress }}" $DB_CONTAINER_NAME_TEST)

echo 'Attempting to insert tables into PTM database at' $docker_ip
until docker exec -t $DB_CONTAINER_NAME_TEST mysql -u$DB_USER_TEST -p"$DB_PWD_TEST" -h $docker_ip -P 3306 -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME_TEST}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"
do
  echo "Retrying in 5 seconds..."
  sleep 5
done

docker exec -i $DB_CONTAINER_NAME_TEST mysql -u$DB_USER_TEST -p"$DB_PWD_TEST" -h $docker_ip -P 3306 --database "$DB_NAME_TEST" < ./db/PTM.sql

echo DCD database setup started.
docker stop $CMN_DB_CONTAINER_NAME_TEST
docker rm $CMN_DB_CONTAINER_NAME_TEST
docker run -p 127.0.0.1:$CMN_DB_PORT_TEST:3306 -p 127.0.0.1:${CMN_DB_PORT_TEST}0:33060 --detach --name=$CMN_DB_CONTAINER_NAME_TEST --env="MYSQL_ROOT_PASSWORD=$CMN_DB_PWD_TEST" mysql:8.0.15 --default-time-zone="+09:00" --lower-case-table-names
docker logs $CMN_DB_CONTAINER_NAME_TEST
docker inspect $CMN_DB_CONTAINER_NAME_TEST | grep "IPAddress"
cmn_db_docker_ip=$(docker inspect -f "{{ .NetworkSettings.IPAddress }}" $CMN_DB_CONTAINER_NAME_TEST)

echo 'Attempting to insert tables into DCD database at' $cmn_db_docker_ip
until docker exec -t $CMN_DB_CONTAINER_NAME_TEST mysql -u$CMN_DB_USER_TEST -p"$CMN_DB_PWD_TEST" -h $cmn_db_docker_ip -P 3306 -e "CREATE DATABASE IF NOT EXISTS \`${CMN_DB_NAME_TEST}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"
do
  echo "Retrying in 5 seconds..."
  sleep 5
done

docker exec -i $CMN_DB_CONTAINER_NAME_TEST mysql -u$CMN_DB_USER_TEST -p"$CMN_DB_PWD_TEST" -h $cmn_db_docker_ip -P 3306 --database "$CMN_DB_NAME_TEST" < ./db/DCD.sql
