import * as AWS from "aws-sdk";
import * as AWSMock from "aws-sdk-mock";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { RDSAdapter } from "../../../src-ts/adapters/rdsadapter";
import * as test_vars from "../../test_vars";

chai.should();

chai.use(sinonChai);

var expect = chai.expect; // we are using the "expect" style of Chai
const sandbox = sinon.createSandbox();

AWSMock.setSDKInstance(AWS);
const mockedRDS = new AWS.RDS();

let rdsAdapterUnderTest = sandbox.spy(new RDSAdapter(test_vars.TEST_LOGGER));

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
    const res = await rdsAdapterUnderTest.stopCluster(
      test_vars.TEST_RDS_CLUSTER_ID
    );

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
    const res = await rdsAdapterUnderTest.startCluster(
      test_vars.TEST_RDS_CLUSTER_ID
    );

    res.should.equal(true);

    AWSMock.restore("RDS");
  });
});
