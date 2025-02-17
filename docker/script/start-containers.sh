#!/bin/sh

# Create and start containers
docker-compose -f docker/docker-compose.yml up "$@"
