import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// Create an AWS Elastic Container Registry for this project
const repo = new awsx.ecr.Repository("test-api");
export const repoName = repo.repository.name;
export const registryUrl = repo.repository.repositoryUrl;
// export const registryToken = pulumi.output(aws.ecr.getAuthorizationToken());
