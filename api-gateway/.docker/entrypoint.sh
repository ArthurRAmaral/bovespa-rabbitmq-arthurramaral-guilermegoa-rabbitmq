#!/bin/sh

PATH=${PATH}:$HOME/app/node_modules/.bin

yarn install --silent

exec "$@"
