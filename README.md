# This is a Test API

.. to actually check how to package, containerize, publish and run/expose a Scala Akka-HTTP artefact on
infrastructure-as-code with Pulumi on AWS ECR, ECS and Fargate.

## Prerequisites

You need to a few things installed 
* docker-client
* AWS CLI v2
* Pulumi CLI

## Deployment run

You need to log into your AWS account via the CLI and obtain access keys/credentials in your local environment. 
Easy to do with e.g `export AWS_PROFILE=something && aws sso login --profile=something` and `yawsso -p something`.

Create the infrastructure with `pulumi -C infrastructure up` and issue `./stack-to-env.sh` to make stack information
available to SBT via .env-file

Do a Docker login to the ECR via `infrastructure/docker-login.sh`

Now you can issue a `sbt docker:publish`
