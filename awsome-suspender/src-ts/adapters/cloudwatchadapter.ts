import * as AWS from "aws-sdk";
import * as winston from "winston";

export class CloudwatchAdapter {
  private logger: winston.Logger;
  constructor(logger: winston.Logger) {
    this.logger = logger;
  }

  /*
  response = self.cloudwatch_object.get_metric_data(
            MetricDataQueries=[
                {
                    'Id': 'fetching_data_for_something',
                    'Expression': "SEARCH('{AWS/RDS,DBInstanceIdentifier} MetricName=\"DatabaseConnections\"', 'Average', 300)",
                    'ReturnData': True
                },
            ],
            EndTime=datetime.datetime.utcnow(),
            StartTime=datetime.datetime.utcnow() - datetime.timedelta(hours=2),
            ScanBy='TimestampDescending',
            MaxDatapoints=123
        )
        */

  public getDatabaseConnections = async (clusterIdentifier: string) => {
    try {
      const metricDataQuery: AWS.CloudWatch.MetricDataQuery = {
        Id: "dbcon",
        MetricStat: {
          Metric: {
            Namespace: "AWS/RDS",
            MetricName: "DatabaseConnections",
            Dimensions: [
              {
                Name: "DBClusterIdentifier",
                Value: clusterIdentifier,
              },
            ],
          },
          Period: 60,
          Stat: "Average",
        },

        ReturnData: true,
      };
      const now = new Date();
      const fiveMinutesAgo = new Date(now);
      fiveMinutesAgo.setMinutes(now.getMinutes() - 5);
      const res = await new AWS.CloudWatch()
        .getMetricData({
          EndTime: now,
          MetricDataQueries: [metricDataQuery],
          StartTime: fiveMinutesAgo,
        })
        .promise();
      const databaseConnections = res.MetricDataResults[0].Values[0];
      if (!databaseConnections) {
        throw new Error(`No metrics found for ${clusterIdentifier}`);
      }
      this.logger.info(
        `Successfully read DatabaseConnection for ${clusterIdentifier} as ${databaseConnections}`
      );
      return databaseConnections;
    } catch (e) {
      this.logger.error(e);
    }
  };
}
