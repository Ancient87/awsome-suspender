import * as AWS from "aws-sdk";
import * as AWSMock from "aws-sdk-mock";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { RDSAdapter } from "../../src-ts/adapters/rdsadapter";
import { ECSAdapter } from "../../src-ts/adapters/ecsadapter";
import {
  Suspender,
  TimeBasedECSTarget,
  TimeOfDay,
} from "../../src-ts/services/suspender";
import * as test_vars from "../test_vars";
import { CloudwatchAdapter } from "../../src-ts/adapters/cloudwatchadapter";

chai.should();

chai.use(sinonChai);

const sandbox = sinon.createSandbox();

const fakeECSAdapter = sandbox.stub(new ECSAdapter(test_vars.TEST_LOGGER));
const fakeRDSAdapter = sandbox.stub(new RDSAdapter(test_vars.TEST_LOGGER));
const fakeCWAdapter = sandbox.stub(
  new CloudwatchAdapter(test_vars.TEST_LOGGER)
);

const testTimeBasedTarget = sandbox.stub(
  new TimeBasedECSTarget({
    startOfOperatingHours: new TimeOfDay(8, 30),
    endOfOperatingHours: new TimeOfDay(22, 0),
    scaledCount: 1,
    scaledDownCount: 0,
    resourceId: test_vars.TEST_SERVICE_ID,
  })
);

let suspenderUnderTest = sandbox.spy(
  new Suspender({
    logger: test_vars.TEST_LOGGER,
    ecsAdapter: fakeECSAdapter,
    cwAdapter: fakeCWAdapter,
    rdsAdapter: fakeRDSAdapter,
  })
);

describe(`TimeBased shutdown`, async () => {
  afterEach(() => {
    sandbox.reset();
  });

  it(`should scale ECS to ${testTimeBasedTarget.scaledDownCount} if we're out of operating hours`, async () => {
    testTimeBasedTarget.isInOperatingHours.returns(false);
    await suspenderUnderTest.scaleECSBasedOnTime(testTimeBasedTarget);
    fakeECSAdapter.scaleServiceTo.should.be.calledOnceWith(
      test_vars.TEST_SERVICE_ID,
      testTimeBasedTarget.scaledDownCount
    );
  });

  it(`should scale ECS to ${testTimeBasedTarget.scaledCount} if we're in operating hours`, async () => {
    testTimeBasedTarget.isInOperatingHours.returns(true);
    await suspenderUnderTest.scaleECSBasedOnTime(testTimeBasedTarget);
    fakeECSAdapter.scaleServiceTo.should.be.calledOnceWith(
      test_vars.TEST_SERVICE_ID,
      testTimeBasedTarget.scaledCount
    );
  });
});
