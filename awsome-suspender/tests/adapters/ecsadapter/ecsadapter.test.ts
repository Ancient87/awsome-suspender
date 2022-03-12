import * as AWS from "aws-sdk";
import * as AWSMock from "aws-sdk-mock";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { ECSAdapter } from "../../../src-ts/adapters/ecsadapter";
import * as test_vars from "../../test_vars";

chai.should();
chai.use(sinonChai);

var expect = chai.expect; // we are using the "expect" style of Chai
const sandbox = sinon.createSandbox();

let ecsAdapterUnderTest = sandbox.spy(new ECSAdapter(test_vars.TEST_LOGGER));

describe(`Scale services`, () => {
  beforeEach(() => {});

  it(`Should scale the service to 0`, async () => {
    AWSMock.mock(
      "ECS",
      "updateService",
      (params: AWS.ECS.UpdateServiceRequest, callback: Function) => {
        if (params.service === test_vars.TEST_SERVICE_ID) {
          callback(null, {});
        }
      }
    );
    const res = await ecsAdapterUnderTest.scaleServiceTo(
      test_vars.TEST_SERVICE_ID,
      0
    );
  });

  it(`Should scale the service to 1`, async () => {});
});
