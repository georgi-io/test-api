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

Create the infrastructure with `pulumi up` and take note of the exported values, especially the ECR url.
You will need to modify two things in `build.sbt`:
* `dockerRepository := Some("927485958639.dkr.ecr.eu-central-1.amazonaws.com")`
* `packageName := "test-api-dea2bfe"`

which in fact is the ECR repository url split at '/'

Do a Docker login to the ECR via `infrastructure/docker-login.sh`

Now you can issue a `sbt docker:publish`
