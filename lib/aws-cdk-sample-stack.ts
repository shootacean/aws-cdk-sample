import cdk = require('@aws-cdk/core');
import ec2 = require('@aws-cdk/aws-ec2');
import {SubnetType} from "@aws-cdk/aws-ec2";

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
      description: 'EC2 Instance Security Group'
    });
    ec2SecurityGroup.addIngressRule(
        ec2.Peer.ipv4('your ip address'),
        ec2.Port.tcp(22),
        'Allow SSH from my home.',
    );
    ec2SecurityGroup.addIngressRule(
        ec2.Peer.ipv4('your ip address'),
        ec2.Port.tcp(80),
        'Allow HTTP from my home.',
    );

    const instance = new ec2.Instance(this, 'EC2Instance', {
      vpc: vpc,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
      machineImage: new ec2.AmazonLinuxImage({
        edition: ec2.AmazonLinuxEdition.STANDARD, generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3_AMD, ec2.InstanceSize.NANO),
      instanceName: 'SampleApp',
      keyName: 'aws-cdk-sample',
      securityGroup: ec2SecurityGroup,
    });
    instance.addUserData(
        'yum update -y',
        'amazon-linux-extras -y nginx1',
        'systemctl enable nginx.service',
        'systemctl start nginx.service',
    );
  }
}
