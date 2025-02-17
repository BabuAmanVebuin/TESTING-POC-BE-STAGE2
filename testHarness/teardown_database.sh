#!/usr/bin/env bash
. ./.env
docker stop $DB_CONTAINER_NAME_TEST
docker rm $DB_CONTAINER_NAME_TEST
docker stop $CMN_DB_CONTAINER_NAME_TEST
docker rm $CMN_DB_CONTAINER_NAME_TEST
