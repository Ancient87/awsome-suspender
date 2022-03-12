import { bool } from "aws-sdk/clients/signer";

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
    date.setSeconds(0);
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

export type TargetCondition = () => boolean;

export interface ConditionBasedTargetProps extends TimeBasedTargetProps {
  conditions: Array<TargetCondition>;
}

export class ConditionBasedTarget extends TimeBasedTarget {
  conditions: Array<TargetCondition>;
  constructor(props: ConditionBasedTargetProps) {
    super(props);
    this.conditions = props.conditions;
  }

  public shouldScaleUp(): bool {
    debugger;
    throw new Error(`Not implemented`);
  }
  public shouldScaleDown(): bool {
    throw new Error(`Not implemented`);
  }
}

export class TimeBasedECSTarget extends TimeBasedTarget {}
export class TimeBasedRDSTarget extends TimeBasedTarget {}
export class RDSConditionBasedTarget extends ConditionBasedTarget {}
