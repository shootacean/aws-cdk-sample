import cdk = require('@aws-cdk/core');
import codedeploy = require('@aws-cdk/aws-codedeploy');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
import s3 = require('@aws-cdk/aws-s3');

export class CodePipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create CodeDeploy
    const helloApp = new codedeploy.ServerApplication(this, 'Hello', {
      applicationName: 'Hello',
    });
    const deployGroup = new codedeploy.ServerDeploymentGroup(this, 'DeployGroup', {
      application: helloApp,
      deploymentGroupName: 'EC2-in-place',
      deploymentConfig: codedeploy.ServerDeploymentConfig.ONE_AT_A_TIME,
      ec2InstanceTags: new codedeploy.InstanceTagSet({
        "App": ['Hello']
      }),
    });

    // Create Actions
    const sourceOutput = new codepipeline.Artifact();
    // S3
    const sourceBucket = new s3.Bucket(this, 'CodePipelineSourceBucket', {
      bucketName: 'hello-pipeline-source' + this.account,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const sourceAction = new codepipeline_actions.S3SourceAction({
      actionName: 'Source',
      bucket: sourceBucket,
      bucketKey: 'hello.zip',
      trigger: codepipeline_actions.S3Trigger.EVENTS,
      output: sourceOutput
    });
    const deployAction = new codepipeline_actions.CodeDeployServerDeployAction({
      actionName: 'ServerDeploy',
      deploymentGroup: deployGroup,
      input: sourceOutput
    });

    // Create Pipeline
    const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      pipelineName: 'HelloPipeline',
      stages: [
        {
          stageName: 'Source',
          actions: [sourceAction,]
        },
        {
          stageName: 'Deploy',
          actions: [deployAction,]
        }
      ],
    });

  };
}
