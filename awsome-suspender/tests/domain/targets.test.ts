import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as chai from "chai";
import * as test_vars from "../test_vars";
import { TimeBasedECSTarget, TimeOfDay } from "../../src-ts/domain/targets";

chai.should();

chai.use(sinonChai);

const sandbox = sinon.createSandbox();

const ecsTimeBasedTarget = new TimeBasedECSTarget({
  startOfOperatingHours: test_vars.startOfOperatingHours,
  endOfOperatingHours: test_vars.endOfOperatingHours,
  scaledCount: 1,
  scaledDownCount: 0,
  resourceId: test_vars.TEST_SERVICE_ID,
});

const testTimeOutOfHoursBefore = new Date(
  test_vars.startOfOperatingHours.toDate()
);
testTimeOutOfHoursBefore.setMinutes(
  test_vars.startOfOperatingHours.minutes - 1
);

const testTimeOutOfHoursAfter = new Date(
  test_vars.endOfOperatingHours.toDate()
);
testTimeOutOfHoursAfter.setMinutes(test_vars.endOfOperatingHours.minutes + 1);

describe(`TimeBasedTargets`, () => {
  afterEach(() => {
    sandbox.reset();
  });

  it(`Should return out of hours if time is ${testTimeOutOfHoursBefore}`, () => {
    sandbox.useFakeTimers(new Date(testTimeOutOfHoursBefore));
    const isInOperatingHours = ecsTimeBasedTarget.isInOperatingHours();
    isInOperatingHours.should.equal(false);
  });

  it(`Should return out of hours if time is ${testTimeOutOfHoursAfter}`, () => {
    sandbox.useFakeTimers(new Date(testTimeOutOfHoursAfter));
    const isInOperatingHours = ecsTimeBasedTarget.isInOperatingHours();
    isInOperatingHours.should.equal(false);
  });

  it(`Should return in hours if time is ${test_vars.startOfOperatingHours.toDate()}`, () => {
    sandbox.useFakeTimers(new Date(test_vars.startOfOperatingHours.toDate()));
    const isInOperatingHours = ecsTimeBasedTarget.isInOperatingHours();
    isInOperatingHours.should.equal(true);
  });

  it(`Should return in hours if time is ${test_vars.endOfOperatingHours.toDate()}`, () => {
    sandbox.useFakeTimers(new Date(test_vars.endOfOperatingHours.toDate()));
    const isInOperatingHours = ecsTimeBasedTarget.isInOperatingHours();
    isInOperatingHours.should.equal(true);
  });
});
