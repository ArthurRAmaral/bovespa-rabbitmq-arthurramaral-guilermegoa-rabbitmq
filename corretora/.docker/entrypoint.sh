#!/bin/sh

PATH=${PATH}:$HOME/app/node_modules/.bin

RMQ_HOST=${RMQ_HOST:?}
RMQ_PORT=${RMQ_PORT:?}

until nc -z ${RMQ_HOST} ${RMQ_PORT}; do
  sleep 0.1
done

yarn install --silent

exec "$@"
