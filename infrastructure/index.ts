import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import * as acmCert from 'pulumi-acm-dns-validated-cert';
import * as pulumi from '@pulumi/pulumi';
import { Role } from '@pulumi/aws/iam';

// See infrastructure stack!!
export const DNS_ZONE_ID = 'Z03824391ACAV1RM34QPB';
export const IDENTITY_PROVIDER_ARN = 'arn:aws:iam::927485958639:oidc-provider/token.actions.githubusercontent.com';
export const DEPLOY_VERSION = '0.0.3-SNAPSHOT';

const repo = new awsx.ecr.Repository('test-api', {
  lifeCyclePolicyArgs: {
    rules: [{
      selection: 'any',
      maximumNumberOfImages: 3,
    }]
  },
  tags: {
    name: 'test-api'
  }
});

//  Needs to be incorporated into build.sbt
export const repositoryUrl = repo.repository.repositoryUrl;


const deployRole = new aws.iam.Role('deploy-role', {
  assumeRolePolicy: JSON.stringify({
    Version: '2012-10-17',
    Statement: [{
      Sid: 'RoleForGithub',
      Action: 'sts:AssumeRoleWithWebIdentity',
      Effect: 'Allow',
      Principal: {Federated: IDENTITY_PROVIDER_ARN},
      Condition: {StringLike: {'token.actions.githubusercontent.com:sub': `repo:georgi-io/test-api:*`}}
    }]
  })
});

const deployRolePolicy = new aws.iam.RolePolicy('deploy-role-policy', {
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

// Needs to be put into GitHub-Action
export const DEPLOY_ROLE_ARN = deployRole.arn;

const certificate = new acmCert.ACMCert('certificate', {
  subject: 'test-api.dev.georgi.io',
  zoneId: DNS_ZONE_ID
});


// THIS COSTS MONEY
const cluster = new awsx.ecs.Cluster('test-api-cluster');
const alb = new awsx.elasticloadbalancingv2.ApplicationLoadBalancer(
  'test-api--lb', {external: true, securityGroups: cluster.securityGroups});
const atg = alb.createTargetGroup(
  'test-api--tg', {port: 9000, protocol: 'HTTP', deregistrationDelay: 0});
const web = atg.createListener('web', {port: 443, certificateArn: certificate.certificateArn});
const image = repositoryUrl.apply(r => r + ':' + DEPLOY_VERSION);
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
  desiredCount: 1,
});

const dnsName = new aws.route53.Record("dns_cname", {
  zoneId: DNS_ZONE_ID,
  name: "test-api.dev.georgi.io",
  type: "CNAME",
  ttl: 300,
  records: [web.endpoint.hostname]
});




