import * as os from 'os';
import * as path from 'path';
import { BaseAdapter } from './base-adapter';
import { CommandTemplate } from '../../types/agent';
import { FileSystem } from '../../utils/file-system';

/**
 * Gemini CLI adapter
 * Commands stored as TOML files under .gemini/commands
 */
export class GeminiAdapter extends BaseAdapter {
  readonly name = 'gemini';
  readonly displayName = 'Gemini CLI';
  readonly directory = '.gemini/commands';
  readonly fileExtension = '.toml';
  readonly features = {
    supportsSubdirectories: true,
    supportsFrontmatter: false,
    argumentPlaceholder: '{{args}}',
  };

  async detectProject(): Promise<boolean> {
    if (await FileSystem.exists('.gemini')) {
      return true;
    }

    const homePath = path.join(this.getHomeDir(), '.gemini');
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
