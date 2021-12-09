#!/usr/bin/env bash

IFS='/ ' read -r -a registryUrl <<< `pulumi -C infrastructure stack output registryUrl`
APP_DOCKER_REPOSITORY="${registryUrl[0]}"
APP_DOCKER_IMAGE_NAME="${registryUrl[1]}"

export APP_DOCKER_REPOSITORY=$APP_DOCKER_REPOSITORY
export APP_DOCKER_IMAGE_NAME=$APP_DOCKER_IMAGE_NAME
