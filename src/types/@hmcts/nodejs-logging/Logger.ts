declare module '@hmcts/nodejs-logging' {
  class Logger {
    static getLogger(loggerName: string): import('winston').LoggerInstance;
  }
}
