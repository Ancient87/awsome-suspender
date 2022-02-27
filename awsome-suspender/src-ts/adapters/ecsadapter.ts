import * as AWS from "aws-sdk";
import * as winston from "winston";

export class ECSAdapter {
  private logger: winston.Logger;
  constructor(logger: winston.Logger) {
    this.logger = logger;
  }

  public scaleServiceTo = async (service: string, desiredCount: number) => {
    try {
      const res = await new AWS.ECS()
        .updateService({ service: service, desiredCount: desiredCount })
        .promise();
      this.logger.info(
        `Successfully requested scale for ${service} to ${desiredCount}`
      );
      return true;
    } catch (e) {
      this.logger.error(e);
    }
  };
}
