import { Logger } from "@hmcts/nodejs-logging";

const logger = Logger.getLogger("applicationRunner");

export class Properties {

  public static configure(): void {
    logger.info("Reading Secrets");
  }

}
