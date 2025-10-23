# awspack-lite

Grab only what you need — a compact AWS SDK v3 bundle for faster builds and deploys.

| Services included in awspack-lite           |
| ------------------------------------------- |
| `@aws-sdk/client-api-gateway`               |
| `@aws-sdk/client-apigatewayv2`              |
| `@aws-sdk/client-cloudformation`            |
| `@aws-sdk/client-cloudfront`                |
| `@aws-sdk/client-cloudwatch`                |
| `@aws-sdk/client-cloudwatch-logs`           |
| `@aws-sdk/client-cognito-identity`          |
| `@aws-sdk/client-cognito-identity-provider` |
| `@aws-sdk/client-dynamodb`                  |
| `@aws-sdk/client-ec2`                       |
| `@aws-sdk/client-ecr`                       |
| `@aws-sdk/client-ecs`                       |
| `@aws-sdk/client-eventbridge`               |
| `@aws-sdk/client-iam`                       |
| `@aws-sdk/client-lambda`                    |
| `@aws-sdk/client-rds`                       |
| `@aws-sdk/client-route-53`                  |
| `@aws-sdk/client-s3`                        |
| `@aws-sdk/client-secrets-manager`           |
| `@aws-sdk/client-sesv2`                     |
| `@aws-sdk/client-sfn`                       |
| `@aws-sdk/client-sns`                       |
| `@aws-sdk/client-sqs`                       |
| `@aws-sdk/client-ssm`                       |
| `@aws-sdk/client-sts`                       |

Need the full catalog? Check out the all-in-one package: [awspack](https://www.npmjs.com/package/awspack).

## Install

```bash
npm i awspack-lite
```

## Use

```js
import { s3, lambda } from "awspack-lite";

const s3Client = new s3.S3Client({ region: "ap-northeast-2" });
const lambdaClient = new lambda.LambdaClient({});
```

Future bundles may group services by domain (e.g., analytics-only, serverless-only ...)
Ideas and feedback are welcome via issues.

MIT License.
