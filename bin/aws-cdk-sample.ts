#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import {AwsCdkSampleStack} from '../lib/aws-cdk-sample-stack';
import {CodePipelineStack} from '../lib/code-pipeline-stack';

const app = new cdk.App();
new AwsCdkSampleStack(app, 'AwsCdkSampleStack');
new CodePipelineStack(app, 'CodePipelineStack');
