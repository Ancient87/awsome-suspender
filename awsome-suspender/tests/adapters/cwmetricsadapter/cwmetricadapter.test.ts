import * as AWS from "aws-sdk";
import * as AWSMock from "aws-sdk-mock";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { CloudwatchAdapter } from "../../../src-ts/adapters/cloudwatchadapter";
import * as test_vars from "../../test_vars";

chai.should();
chai.use(sinonChai);

var expect = chai.expect; // we are using the "expect" style of Chai
const sandbox = sinon.createSandbox();

let cloudwatchAdapterUnderTest = sandbox.spy(
  new CloudwatchAdapter(test_vars.TEST_LOGGER)
);

describe(`Basic Metrics get`, () => {
  it(`Should retrieve DBConnection metrics for a given clustername`, async () => {
    const expectedActiveConnections = 5;
    AWSMock.mock(
      "CloudWatch",
      "getMetricData",
      (params: AWS.CloudWatch.GetMetricDataInput, callback: Function) => {
        const metricDataResult: AWS.CloudWatch.MetricDataResult = {
          Values: [expectedActiveConnections],
        };
        const result = {
          MetricDataResults: [metricDataResult],
        };
        callback(null, result);
      }
    );
    const res = await cloudwatchAdapterUnderTest.getDatabaseConnections(
      test_vars.TEST_RDS_CLUSTER_ID
    );

    res.should.equal(expectedActiveConnections);
  });
});
