import winston = require("winston");
import { CloudwatchAdapter } from "../adapters/cloudwatchadapter";
import { ECSAdapter } from "../adapters/ecsadapter";
import { RDSAdapter } from "../adapters/rdsadapter";
import {
  TimeBasedTarget,
  TimeBasedECSTarget,
  ConditionBasedTarget,
} from "../domain/targets";

export interface SuspenderProps {
  ecsAdapter: ECSAdapter;
  rdsAdapter: RDSAdapter;
  cwAdapter: CloudwatchAdapter;
  logger: winston.Logger;
}

export class Suspender {
  ecsAdpter: ECSAdapter;
  rdsAdapter: RDSAdapter;
  cwAdapter: CloudwatchAdapter;
  logger: winston.Logger;
  timeBasedTargets: Array<TimeBasedTarget>;
  constructor(props: SuspenderProps) {
    this.ecsAdpter = props.ecsAdapter;
    this.rdsAdapter = props.rdsAdapter;
    this.cwAdapter = props.cwAdapter;
    this.logger = props.logger;
  }

  public async scaleRDSBasedOnCondition(
    testConditionBasedTarget: ConditionBasedTarget
  ): Promise<void> {
    const shouldScaleDown = testConditionBasedTarget.shouldScaleUp();
    const shouldScaleUp = testConditionBasedTarget.shouldScaleDown();

    if (shouldScaleUp) {
      await this.rdsAdapter.startCluster(testConditionBasedTarget.resourceId);
    } else if (shouldScaleDown) {
      await this.rdsAdapter.stopCluster(testConditionBasedTarget.resourceId);
    }
  }

  public async scaleECSBasedOnTime(
    timeBasedTarget: TimeBasedECSTarget
  ): Promise<void> {
    const shouldScaleDown = !timeBasedTarget.isInOperatingHours();
    const shouldScaleUp = timeBasedTarget.isInOperatingHours();

    if (shouldScaleDown) {
      await this.ecsAdpter.scaleServiceTo(
        timeBasedTarget.resourceId,
        timeBasedTarget.scaledDownCount
      );
    } else if (shouldScaleUp) {
      await this.ecsAdpter.scaleServiceTo(
        timeBasedTarget.resourceId,
        timeBasedTarget.scaledCount
      );
    }
    return;
  }
}
