#!/bin/sh

# Remove images and containers
docker-compose -f docker/docker-compose.yml down --rmi all --volumes --remove-orphans "$@"
