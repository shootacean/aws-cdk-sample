import cdk = require('@aws-cdk/core');
import ec2 = require('@aws-cdk/aws-ec2');
import iam = require('@aws-cdk/aws-iam');

export class AwsCdkSampleStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'Vpc', {
      cidr: '10.0.0.0/16',
    });

    const ec2SecurityGroup = new ec2.SecurityGroup(this, 'EC2SecurityGroup', {
      vpc: vpc,
      allowAllOutbound: true,
      securityGroupName: 'EC2SecurityGroup',
      description: 'EC2 Instance Security Group',
    });
    ec2SecurityGroup.addIngressRule(
        ec2.Peer.ipv4('60.138.238.87/32'),
        ec2.Port.tcp(22),
        'Allow SSH from my home.',
    );
    ec2SecurityGroup.addIngressRule(
        ec2.Peer.ipv4('60.138.238.87/32'),
        ec2.Port.tcp(80),
        'Allow HTTP from my home.',
    );
    cdk.Tag.add(ec2SecurityGroup, 'App', 'Hello');

    const instanceProfile = new iam.Role(this, 'EC2InstanceRole', {
      roleName: 'EC2InstanceRole',
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'),
      ],
    });

    const instance = new ec2.Instance(this, 'EC2Instance', {
      vpc: vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      machineImage: new ec2.AmazonLinuxImage({
        edition: ec2.AmazonLinuxEdition.STANDARD, generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3_AMD, ec2.InstanceSize.NANO),
      instanceName: 'HelloApp',
      role: instanceProfile,
      keyName: 'aws-cdk-sample',
      securityGroup: ec2SecurityGroup,
    });
    instance.addUserData(
        'yum update -y',
        'amazon-linux-extras install -y nginx1',
        'systemctl enable nginx.service',
        'systemctl start nginx.service',
        'yum install -y ruby wget',
        'cd /home/ec2-user',
        'wget https://aws-codedeploy-ap-northeast-1.s3.ap-northeast-1.amazonaws.com/latest/install',
        'chmod +x ./install',
        './install auto'
    );
    cdk.Tag.add(instance, 'App', 'Hello');
  };
}
