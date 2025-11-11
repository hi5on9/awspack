# awspack

Import every AWS SDK v3 client from a single package — no more juggling dozens of `@aws-sdk/client-*` installs.
Always stays up to date with the latest AWS SDK releases.

Prefer something leaner? Try the curated bundle: [awspack-lite](https://www.npmjs.com/package/awspack-lite).

<details>
  <summary>awspack-lite includes</summary>
  <table>
    <thead>
      <tr>
        <th>services</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><code>@aws-sdk/client-api-gateway</code></td></tr>
      <tr><td><code>@aws-sdk/client-apigatewayv2</code></td></tr>
      <tr><td><code>@aws-sdk/client-cloudformation</code></td></tr>
      <tr><td><code>@aws-sdk/client-cloudfront</code></td></tr>
      <tr><td><code>@aws-sdk/client-cloudwatch</code></td></tr>
      <tr><td><code>@aws-sdk/client-cloudwatch-logs</code></td></tr>
      <tr><td><code>@aws-sdk/client-cognito-identity</code></td></tr>
      <tr><td><code>@aws-sdk/client-cognito-identity-provider</code></td></tr>
      <tr><td><code>@aws-sdk/client-dynamodb</code></td></tr>
      <tr><td><code>@aws-sdk/client-ec2</code></td></tr>
      <tr><td><code>@aws-sdk/client-ecr</code></td></tr>
      <tr><td><code>@aws-sdk/client-ecs</code></td></tr>
      <tr><td><code>@aws-sdk/client-eventbridge</code></td></tr>
      <tr><td><code>@aws-sdk/client-iam</code></td></tr>
      <tr><td><code>@aws-sdk/client-lambda</code></td></tr>
      <tr><td><code>@aws-sdk/client-rds</code></td></tr>
      <tr><td><code>@aws-sdk/client-route-53</code></td></tr>
      <tr><td><code>@aws-sdk/client-s3</code></td></tr>
      <tr><td><code>@aws-sdk/client-secrets-manager</code></td></tr>
      <tr><td><code>@aws-sdk/client-sesv2</code></td></tr>
      <tr><td><code>@aws-sdk/client-sfn</code></td></tr>
      <tr><td><code>@aws-sdk/client-sns</code></td></tr>
      <tr><td><code>@aws-sdk/client-sqs</code></td></tr>
      <tr><td><code>@aws-sdk/client-ssm</code></td></tr>
      <tr><td><code>@aws-sdk/client-sts</code></td></tr>
    </tbody>
  </table>
</details>

## Install

```bash
npm i awspack
```

## Use

```js
import { s3, lambda } from "awspack";

const s3Client = new s3.S3Client({ region: "us-east-1" });
const lambdaClient = new lambda.LambdaClient({});

import { S3Client } from "awspack/clients/s3"; // service-specific entry

const ec2Client = new ec2.EC2Client({});
```

Future bundles may group services by domain (e.g., analytics-only, serverless-only ...)
Ideas and feedback are welcome via issues.

MIT License.
