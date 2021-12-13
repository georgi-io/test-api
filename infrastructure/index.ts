import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const deployVersion = "0.0.1-SNAPSHOT"

const repo = new awsx.ecr.Repository("test-api");
export const repositoryUrl = repo.repository.repositoryUrl;
const image = repositoryUrl.apply(r => r + ":" + deployVersion);

// const lb = new awsx.lb.ApplicationListener("test-api-listener", { port: 9000, protocol: "HTTP" });
// const nginx = new awsx.ecs.FargateService("test-api-service", {
//   taskDefinitionArgs: {
//     containers: {
//       testapi: {
//         image: image,
//         memory: 128,
//         portMappings: [ lb ],
//       },
//     },
//   },
//   desiredCount: 1,
// });
//
// export const url = lb.endpoint.hostname;

// const deployUser = new aws.iam.User("test-api-deployment-user", {
//   path: "/system/",
//   tags: { "Name": "test-api-deployment-user"}
// });
// const deployUserAccessKey = new aws.iam.AccessKey("test-api-deployment-user-key", { user: deployUser.name });
// const deployUserPolicy = new aws.iam.UserPolicy("test-api-deployment-user-policy", {
//   user: deployUser.name,
//   policy: {
//     Version: "2012-10-17",
//     Statement: [{
//       Action: [
//         "ecr:BatchGetImage",
//         "ecr:BatchCheckLayerAvailability",
//         "ecr:CompleteLayerUpload",
//         "ecr:GetDownloadUrlForLayer",
//         "ecr:InitiateLayerUpload",
//         "ecr:PutImage",
//         "ecr:UploadLayerPart"
//       ],
//       Effect: "Allow",
//       Resource: "*"
//     }]
//   },
// });
//
// export const deployUserAccessKeyID = deployUserAccessKey.id
// export const deployUserAccessKeySecret = deployUserAccessKey.encryptedSecret
