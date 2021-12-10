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
