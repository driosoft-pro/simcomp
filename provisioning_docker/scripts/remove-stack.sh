#!/bin/bash
set -e

STACK_NAME=${1:-simcomp}

docker stack rm "${STACK_NAME}"