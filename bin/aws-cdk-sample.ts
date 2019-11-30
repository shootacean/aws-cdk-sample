#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { AwsCdkSampleStack } from '../lib/aws-cdk-sample-stack';

const app = new cdk.App();
new AwsCdkSampleStack(app, 'AwsCdkSampleStack');
