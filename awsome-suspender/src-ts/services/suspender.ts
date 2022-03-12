import winston = require("winston");
import { CloudwatchAdapter } from "../adapters/cloudwatchadapter";
import { ECSAdapter } from "../adapters/ecsadapter";
import { RDSAdapter } from "../adapters/rdsadapter";

export class TimeOfDay {
  hours: number;
  minutes: number;
  constructor(hours: number, minutes: number) {
    this.hours = hours;
    this.minutes = minutes;
  }

  public toDate() {
    const date = new Date();
    date.setHours(this.hours);
    date.setMinutes(this.minutes);
    return date;
  }
}

export interface TargetProps {
  resourceId: string;
  scaledCount: number;
  scaledDownCount: number;
}

export class ScaleTarget {
  public resourceId: string;
  public scaledCount: number;
  public scaledDownCount: number;
  constructor(props: TargetProps) {
    this.resourceId = props.resourceId;
    this.scaledCount = props.scaledCount;
    this.scaledDownCount = props.scaledDownCount;
  }
}

export interface TimeBasedTargetProps extends TargetProps {
  startOfOperatingHours: TimeOfDay;
  endOfOperatingHours: TimeOfDay;
}

export class TimeBasedTarget extends ScaleTarget {
  startOfOperatingHours: TimeOfDay;
  endOfOperatingHours: TimeOfDay;

  constructor(props: TimeBasedTargetProps) {
    super(props);
    this.startOfOperatingHours = props.startOfOperatingHours;
    this.endOfOperatingHours = props.endOfOperatingHours;
  }

  public isInOperatingHours(): boolean {
    const now = new Date();
    const isInOperatingHours =
      now >= this.startOfOperatingHours.toDate() &&
      now <= this.endOfOperatingHours.toDate();
    return isInOperatingHours;
  }
}

export class TimeBasedECSTarget extends TimeBasedTarget {}

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

  public async scaleECSBasedOnTime(
    timeBasedTarget: TimeBasedECSTarget
  ): Promise<void> {
    const shouldShutDown = !timeBasedTarget.isInOperatingHours();
    const shouldScaleUp = timeBasedTarget.isInOperatingHours();

    if (shouldShutDown) {
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
