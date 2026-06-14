/**
 * Basic logger
 */

export class Logger {
  private readonly scope: string;

  constructor(scope: string) {
    this.scope = scope;
  }

  public child(scope: string): Logger {
    return new Logger(`${this.scope} - ${scope}`);
  }

  public info(message: string): void {
    dev: console.info(`${this.scope}: ${message}`);
  }

  public warning(message: string): void {
    dev: console.warn(`${this.scope}: ${message}`);
  }

  public error(message: string, error?: Error): void {
    dev: console.error(`${this.scope}: ${message} \n Error message: ${error?.message} \n StackTrace: ${error?.stack}`);
  }
}
