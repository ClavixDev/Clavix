import * as os from 'os';
import * as path from 'path';
import { BaseAdapter } from './base-adapter';
import { CommandTemplate } from '../../types/agent';
import { FileSystem } from '../../utils/file-system';

/**
 * Qwen Code CLI adapter
 * Commands stored as TOML files under .qwen/commands
 */
export class QwenAdapter extends BaseAdapter {
  readonly name = 'qwen';
  readonly displayName = 'Qwen Code';
  readonly directory = '.qwen/commands';
  readonly fileExtension = '.toml';
  readonly features = {
    supportsSubdirectories: true,
    supportsFrontmatter: false,
    argumentPlaceholder: '{{args}}',
  };

  async detectProject(): Promise<boolean> {
    if (await FileSystem.exists('.qwen')) {
      return true;
    }

    const homePath = path.join(this.getHomeDir(), '.qwen');
    return await FileSystem.exists(homePath);
  }

  getCommandPath(): string {
    return this.directory;
  }

  protected formatCommand(template: CommandTemplate): string {
    const description = template.description.trim().length > 0
      ? `description = ${JSON.stringify(template.description)}\n\n`
      : '';

    const content = template.content.replace(/\{\{ARGS\}\}/g, '{{args}}');

    return `${description}prompt = """\n${content}\n"""\n`;
  }

  private getHomeDir(): string {
    return process.env.CLAVIX_HOME_OVERRIDE || os.homedir();
  }
}
