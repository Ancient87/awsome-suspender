import * as AWS from "aws-sdk";

export interface RDSSuspenderProps {
  rdsClient: AWS.RDS;
}

export class RDSSuspender {
  public readonly rdsClient;
  constructor(props: RDSSuspenderProps) {
    this.rdsClient = props.rdsClient;
  }

  public requestClusterStop = async (clusterId: string)  => {
    try {
      const activeConnectionsResult = await new AWS.RDS().describeDBClusters
    }
  }

  public stopCluster = async (cluserId: string) => {
    try {
      const res = await new AWS.RDS()
        .stopDBCluster({ DBClusterIdentifier: cluserId })
        .promise();
      return true;
    } catch (e) {
      return false;
    }
  };

  public startCluster = async (cluserId: string) => {
    try {
      const res = await new AWS.RDS()
        .startDBCluster({ DBClusterIdentifier: cluserId })
        .promise();
      return true;
    } catch (e) {
      return false;
    }
  };
}
