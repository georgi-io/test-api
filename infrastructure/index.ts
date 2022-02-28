import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';

// See infrastructure stack!!
export const DNS_ZONE_ID = 'Z03824391ACAV1RM34QPB';
export const IDENTITY_PROVIDER_ARN = 'arn:aws:iam::927485958639:oidc-provider/token.actions.githubusercontent.com';
export const DEPLOY_VERSION = '0.0.5-SNAPSHOT';
export const CLUSTER_NAME = 'georgi-cluster-11dd4e2';
export const ALB_ARN = 'arn:aws:elasticloadbalancing:eu-central-1:927485958639:loadbalancer/app/georgi-alb-d3639d0/c03e1d5b789380fc'
export const ALB_LISTENER_HTTPS = 'arn:aws:elasticloadbalancing:eu-central-1:927485958639:listener/app/georgi-alb-d3639d0/c03e1d5b789380fc/b7ee40a673cb48c2'
export const ALB_LISTENER_HTTP = 'arn:aws:elasticloadbalancing:eu-central-1:927485958639:listener/app/georgi-alb-d3639d0/c03e1d5b789380fc/506b595b9a1c2b04'
export const CERTIFICATE_ARN = 'arn:aws:acm:eu-central-1:927485958639:certificate/842ae662-0638-4fb6-94ba-1314f6a1edcb'

let repo = new awsx.ecr.Repository('test-api', {
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
export const REPOSITORY_URL = repo.repository.repositoryUrl;


let deployRole = new aws.iam.Role('deploy-role', {
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

let deployRolePolicy = new aws.iam.RolePolicy('deploy-role-policy', {
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

let vpc = awsx.ec2.Vpc.getDefault();

// MANAGED IN INFRASTRUCTURE!
let cluster = new awsx.ecs.Cluster(CLUSTER_NAME, {
  cluster: aws.ecs.Cluster.get(CLUSTER_NAME, CLUSTER_NAME),
  vpc: vpc
});

// MANAGED IN INFRASTRUCTURE!
let alb = new awsx.lb.ApplicationLoadBalancer(
  'georgi-alb', {
    vpc: vpc,
    loadBalancer: aws.lb.LoadBalancer.get(ALB_ARN, ALB_ARN),
    external: true,
    securityGroups: cluster.securityGroups
  });


let targetGroup = alb.createTargetGroup(
  'test-api--tg', {vpc: vpc, loadBalancer: alb, port: 9000, protocol: 'HTTP', deregistrationDelay: 0});

let appService = new awsx.ecs.FargateService('test-api--svc', {
  cluster,
  taskDefinitionArgs: {
    containers: {
      testapi: {
        image: REPOSITORY_URL.apply(r => r + ':' + DEPLOY_VERSION),
        memory: 128,
        portMappings: [targetGroup],
        environment: [
          { name: 'API_MESSAGE', value: "Test from Service 1" }
        ]
      },
    }
  },
  desiredCount: 1,
});

let albListenerHTTPS = aws.lb.getListener({arn: ALB_LISTENER_HTTPS})
albListenerHTTPS.then(listener => {
  let rule = new aws.lb.ListenerRule("test-api", {
    listenerArn: listener.arn,
    priority: 100,
    actions: [{
      type: "forward",
      targetGroupArn: targetGroup.targetGroup.arn,
    }],
    conditions: [
      {
        pathPattern: {
          values: ["/"]
        },
      },
      {
        hostHeader: {
          values: ["test-api.dev.georgi.io"],
        },
      },
    ],
  });
})

let dnsName = new aws.route53.Record('dns_cname', {
  zoneId: DNS_ZONE_ID,
  name: 'test-api.dev.georgi.io',
  type: 'CNAME',
  ttl: 300,
  records: [alb.loadBalancer.dnsName]
});
