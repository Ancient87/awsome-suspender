import * as AWS from "aws-sdk";
import * as AWSMock from "aws-sdk-mock";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { RDSSuspender } from "../../../src-ts/services/rdssuspender";

chai.should();

chai.use(sinonChai);

var expect = chai.expect; // we are using the "expect" style of Chai
const sandbox = sinon.createSandbox();
const TEST_RDS_CLUSTER_ID = "xlol";

AWSMock.setSDKInstance(AWS);
const mockedRDS = new AWS.RDS();

let rdsSuspenderUnderTest = sandbox.spy(
  new RDSSuspender({ rdsClient: mockedRDS })
);

describe(`Basic Start/Stop RDS`, () => {
  beforeEach(() => {});
  it(`should stop the RDS instance`, async () => {
    AWSMock.mock(
      "RDS",
      "stopDBCluster",
      (params: AWS.RDS.StopDBClusterMessage, callback: Function) => {
        callback(null, {});
      }
    );
    const res = await rdsSuspenderUnderTest.stopCluster(TEST_RDS_CLUSTER_ID);

    res.should.equal(true);

    AWSMock.restore("RDS");
  });

  it(`should start the RDS instance`, async () => {
    AWSMock.mock(
      "RDS",
      "startDBCluster",
      (params: AWS.RDS.StartDBClusterMessage, callback: Function) => {
        callback(null, {});
      }
    );
    const res = await rdsSuspenderUnderTest.startCluster(TEST_RDS_CLUSTER_ID);

    res.should.equal(true);

    AWSMock.restore("RDS");
  });
});

describe(`Stop cluster use cases`, () => {
  it(`Snapshot complete should stop the cluster if we're out of business hours and no clients are connected`, async () => {
    const res = await rdsSuspenderUnderTest.requestClusterStop(
      TEST_RDS_CLUSTER_ID
    );
    res.should.equal(true);
  });
});
