import { CloudwatchAdapter } from "./adapters/cloudwatchadapter";
import * as test_vars from "../tests/test_vars";
import AWS = require("aws-sdk");

AWS.config.logger = console;

const cwAdapter = new CloudwatchAdapter(test_vars.TEST_LOGGER);

const res = cwAdapter
  .getDatabaseConnections(process.env.DB_CLUSTER)
  .then((res) => {
    console.log(res);
  });
