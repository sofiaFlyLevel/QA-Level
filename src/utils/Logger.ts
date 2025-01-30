export class Logger {
    info(message: string, ...args: any[]) {
      console.log(`[INFO] ${message}`, ...args);
    }
  
    warn(message: string, error?: any) {
      console.warn(`[WARN] ${message}`, error);
    }
  
    error(message: string, error?: any) {
      console.error(`[ERROR] ${message}`, error);
    }
  }