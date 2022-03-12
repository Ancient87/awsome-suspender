import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as chai from "chai";
import { RDSAdapter } from "../../src-ts/adapters/rdsadapter";
import { ECSAdapter } from "../../src-ts/adapters/ecsadapter";
import { Suspender } from "../../src-ts/services/suspender";
import * as test_vars from "../test_vars";
import { CloudwatchAdapter } from "../../src-ts/adapters/cloudwatchadapter";
import {
  RDSConditionBasedTarget,
  TimeBasedECSTarget,
} from "../../src-ts/domain/targets";

chai.should();

chai.use(sinonChai);

const sandbox = sinon.createSandbox();

const fakeECSAdapter = sandbox.stub(new ECSAdapter(test_vars.TEST_LOGGER));
const fakeRDSAdapter = sandbox.stub(new RDSAdapter(test_vars.TEST_LOGGER));
const fakeCWAdapter = sandbox.stub(
  new CloudwatchAdapter(test_vars.TEST_LOGGER)
);

const timeBasedECSTarget = new TimeBasedECSTarget({
  startOfOperatingHours: test_vars.startOfOperatingHours,
  endOfOperatingHours: test_vars.endOfOperatingHours,
  scaledCount: 1,
  scaledDownCount: 0,
  resourceId: test_vars.TEST_SERVICE_ID,
});

const testTimeBasedTarget = sandbox.stub(timeBasedECSTarget);

const testConditionBasedTarget = sandbox.stub(
  new RDSConditionBasedTarget({
    ...timeBasedECSTarget,
    conditions: [],
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

describe(`TimeBased scaling`, async () => {
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

describe(`EventBased scaling`, async () => {
  afterEach(() => {
    sandbox.reset();
  });

  it(`Should scale down if there are no clients connected and its out of business hours`, async () => {
    await suspenderUnderTest.scaleRDSBasedOnCondition(testConditionBasedTarget);
    fakeRDSAdapter.stopCluster.should.be.calledOnceWith(
      test_vars.TEST_RDS_CLUSTER_ID
    );
  });

  it(`Should not scale down if there are are clients connected`, async () => {
    await suspenderUnderTest.scaleRDSBasedOnCondition(testConditionBasedTarget);
    fakeRDSAdapter.stopCluster.should.have.not.been.called;
  });

  it(`Should not scale down if its in business hours`, async () => {
    await suspenderUnderTest.scaleRDSBasedOnCondition(testConditionBasedTarget);
    fakeRDSAdapter.stopCluster.should.have.not.been.called;
  });
});
