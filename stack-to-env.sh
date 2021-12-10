#!/usr/bin/env bash

IFS='/ ' read -r -a repoositoryUrl <<< `pulumi -C infrastructure stack output repositoryUrl`

echo "# auto-generated by stack-to-env.sh:\n" > .env
echo "REPO_URL=${repoositoryUrl[0]}" >> .env
echo "REPO_IMAGE=${repoositoryUrl[1]}" >> .env
