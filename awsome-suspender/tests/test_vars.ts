import { TimeOfDay } from "../src-ts/domain/targets";
import { logger } from "../src-ts/services/logger";

export const TEST_LOGGER = logger;
export const TEST_SERVICE_ID = "test_service";
export const TEST_RDS_CLUSTER_ID = "test_rds_cluster";
export const startOfOperatingHours = new TimeOfDay(8, 30);
export const endOfOperatingHours = new TimeOfDay(22, 0);
