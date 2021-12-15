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

const identityProvider = new aws.iam.OpenIdConnectProvider("github-oicd", {
  clientIdLists: ["sts.amazonaws.com"],
  thumbprintLists: [],
  url: "https://token.actions.githubusercontent.com",
})


const deployGitHubAllowPolicy = new aws.iam.RolePolicy("deploy-github-allow-policy", {
  role: deployRole.id,
  policy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [{
      Sid: "RoleForGithub",
      Effect: "Allow",
      Principal: {Federated: identityProvider.arn},
      Action: "sts:AssumeRoleWithWebIdentity",
      Condition: { StringEquals: {"token.actions.githubusercontent.com:sub": "repo:georgi-io/test-api:*" }}
    }]
  })
});

const deployRolePolicy = new aws.iam.RolePolicy("deploy-role-policy", {
  role: deployRole.id,
  policy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [{
      Action: [
        "ecr:BatchGetImage",
        "ecr:BatchCheckLayerAvailability",
        "ecr:CompleteLayerUpload",
        "ecr:GetDownloadUrlForLayer",
        "ecr:InitiateLayerUpload",
        "ecr:PutImage",
        "ecr:UploadLayerPart"
      ],
      Effect: "Allow",
      Resource: "*"
    }]
  })
});

const deployRole = new aws.iam.Role("deploy-role", {
  assumeRolePolicy: data.aws_iam_policy_document.instance_assume_role_policy.json,
  managedPolicyArns: [
    deployGitHubAllowPolicy.arn,
    deployRolePolicy.arn,
  ],

})

export const deployRoleARN = deployRole.arn
