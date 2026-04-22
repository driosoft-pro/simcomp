#!/bin/sh
set -eu

: "${API_URL:=http://localhost:8080}"

envsubst '${API_URL}' \
  < /usr/share/nginx/html/env.template.js \
  > /usr/share/nginx/html/env.js

echo "env.js generado con API_URL=${API_URL}"
