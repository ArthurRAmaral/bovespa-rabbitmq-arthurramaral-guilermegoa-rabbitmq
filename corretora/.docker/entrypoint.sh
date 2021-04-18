#!/bin/sh

PATH=${PATH}:$HOME/app/node_modules/.bin

RMQ_URL=${RMQ_URL}

if [ -z RMQ_ULR ]
then
  until nc -z ${RMQ_URL}; do
    sleep 0.1
  done
fi

yarn install --silent

exec "$@"
