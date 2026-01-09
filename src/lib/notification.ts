import notifier from 'node-notifier';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface NotificationOptions {
  title: string;
  message: string;
  sound?: boolean;
}

export class Notification {
  public static disableNotifications: boolean = false;
  private static notifySendAvailable: boolean = false;
  private static getIcon(): string {
    return join(__dirname, 'assets', 'salesforce.png');
  }

  private static checkModuleAvailable(): void {
    if (this.disableNotifications || this.notifySendAvailable) return;
    try {
      require.resolve('notify-send');
      this.notifySendAvailable = true;
    } catch {
      this.notifySendAvailable = false;
    }
  }

  static async show(options: NotificationOptions): Promise<void> {
    // Check if notifications are disabled
    this.checkModuleAvailable();
    if (this.disableNotifications || !this.notifySendAvailable) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      notifier.notify(
        {
          title: `SSDX ${options.title}`,
          message: options.message,
          contentImage: this.getIcon(),
          sound: options.sound ?? false,
        },
        error => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });
  }

  static async showInfo(message: string, title: string = 'Info'): Promise<void> {
    return this.show({
      title,
      message,
    });
  }

  static async showSuccess(message: string, title: string = 'Success'): Promise<void> {
    return this.show({
      title,
      message,
      sound: false,
    });
  }

  static async showWarning(message: string, title: string = 'Warning'): Promise<void> {
    return this.show({
      title,
      message,
      sound: false,
    });
  }

  static async showError(message: string, title: string = 'Error'): Promise<void> {
    return this.show({
      title,
      message,
      sound: true,
    });
  }
}
