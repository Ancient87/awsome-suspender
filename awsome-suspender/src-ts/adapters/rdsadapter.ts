import * as AWS from "aws-sdk";
import winston = require("winston");

export interface RDSSuspenderProps {
  rdsClient: AWS.RDS;
}

export class RDSAdapter {
  private logger: winston.Logger;
  constructor(logger: winston.Logger) {
    this.logger = logger;
  }

  public stopCluster = async (cluserId: string) => {
    try {
      const res = await new AWS.RDS()
        .stopDBCluster({ DBClusterIdentifier: cluserId })
        .promise();
      this.logger.info(`Successfully issued stop for ${cluserId}`);
      return true;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  };

  public startCluster = async (cluserId: string) => {
    try {
      const res = await new AWS.RDS()
        .startDBCluster({ DBClusterIdentifier: cluserId })
        .promise();
      this.logger.info(`Successfully issued start for ${cluserId}`);
      return true;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  };
}
