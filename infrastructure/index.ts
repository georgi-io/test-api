import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';

const dnsZone = 'Z03824391ACAV1RM34QPB'
const deployVersion = '0.0.1-SNAPSHOT'

const repo = new awsx.ecr.Repository('test-api', {
  lifeCyclePolicyArgs: {
    rules: [{
      selection: 'any',
      maximumNumberOfImages: 3,
    }]
  }
});
export const repositoryUrl = repo.repository.repositoryUrl;


const image = repositoryUrl.apply(r => r + ':' + deployVersion);

const cluster = new awsx.ecs.Cluster('test-api-cluster');
const alb = new awsx.elasticloadbalancingv2.ApplicationLoadBalancer(
  'test-api--lb', {external: true, securityGroups: cluster.securityGroups});
const atg = alb.createTargetGroup(
  'test-api--tg', {port: 9000, protocol: 'HTTP', deregistrationDelay: 0});
const web = atg.createListener('web', {port: 80});

const appService = new awsx.ecs.FargateService('test-api--svc', {
  cluster,
  taskDefinitionArgs: {
    containers: {
      testapi: {
        image: image,
        memory: 128,
        portMappings: [web],
      },
    }
  },
  desiredCount: 2,
});

const dns_cname = new aws.route53.Record("dns_cname", {
  zoneId: dnsZone,
  name: "test-api.dev.georgi.io",
  type: "CNAME",
  ttl: 300,
  records: [web.endpoint.hostname]
});

const identityProvider = new aws.iam.OpenIdConnectProvider('github-oicd', {
  clientIdLists: ['sts.amazonaws.com'],
  thumbprintLists: ['6938FD4D98BAB03FAADB97B34396831E3780AEA1'],
  url: 'https://token.actions.githubusercontent.com',
})

const deployRole = new aws.iam.Role('deploy-role', {
  assumeRolePolicy: identityProvider.arn.apply((providerArn) => JSON.stringify({
    Version: '2012-10-17',
    Statement: [{
      Sid: 'RoleForGithub',
      Action: 'sts:AssumeRoleWithWebIdentity',
      Effect: 'Allow',
      Principal: {Federated: providerArn},
      Condition: {StringLike: {'token.actions.githubusercontent.com:sub': `repo:georgi-io/test-api:*`}}
    }]
  }))
})

new aws.iam.RolePolicy('deploy-role-policy', {
  role: deployRole.id,
  policy: JSON.stringify({
    Version: '2012-10-17',
    Statement: [{
      Action: [
        'ecr:BatchGetImage',
        'ecr:BatchCheckLayerAvailability',
        'ecr:CompleteLayerUpload',
        'ecr:GetDownloadUrlForLayer',
        'ecr:InitiateLayerUpload',
        'ecr:PutImage',
        'ecr:UploadLayerPart',
        'ecr:GetAuthorizationToken'
      ],
      Effect: 'Allow',
      Resource: '*'
    }]
  })
});

export const deployRoleARN = deployRole.arn
