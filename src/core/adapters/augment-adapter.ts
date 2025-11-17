import * as os from 'os';
import * as path from 'path';
import { BaseAdapter } from './base-adapter.js';
import { CommandTemplate } from '../../types/agent.js';
import { FileSystem } from '../../utils/file-system.js';

/**
 * Augment CLI adapter
 * Commands stored in .augment/commands/clavix with optional subdirectories
 */
export class AugmentAdapter extends BaseAdapter {
  readonly name = 'augment';
  readonly displayName = 'Augment CLI';
  readonly directory = '.augment/commands/clavix';
  readonly fileExtension = '.md';
  readonly features = {
    supportsSubdirectories: true,
    supportsFrontmatter: true,
    frontmatterFields: ['description', 'argument-hint', 'model'],
  };

  async detectProject(): Promise<boolean> {
    if (await FileSystem.exists('.augment')) {
      return true;
    }

    const homeAugmentDir = path.join(this.getHomeDir(), '.augment');
    return FileSystem.exists(homeAugmentDir);
  }

  getCommandPath(): string {
    return this.directory;
  }

  protected formatCommand(template: CommandTemplate): string {
    const frontmatter = `---\ndescription: ${template.description}\nargument-hint: [prompt]\n---\n\n`;
    return frontmatter + template.content;
  }

  private getHomeDir(): string {
    return process.env.CLAVIX_HOME_OVERRIDE || os.homedir();
  }
}
