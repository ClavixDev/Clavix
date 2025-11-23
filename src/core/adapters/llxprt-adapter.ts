import * as os from 'os';
import * as path from 'path';
import { BaseAdapter } from './base-adapter.js';
import { CommandTemplate } from '../../types/agent.js';
import { FileSystem } from '../../utils/file-system.js';

/**
 * LLXPRT adapter
 * Commands stored as TOML files under .llxprt/commands/clavix by default
 */
export class LlxprtAdapter extends BaseAdapter {
  readonly name = 'llxprt';
  readonly displayName = 'LLXPRT';
  readonly fileExtension = '.toml';
  readonly features = {
    supportsSubdirectories: true,
    supportsFrontmatter: false,
    argumentPlaceholder: '{{args}}',
  };

  constructor(private readonly options: { useNamespace?: boolean } = {}) {
    super();
  }

  get directory(): string {
    const useNamespace = this.options.useNamespace ?? true;
    return useNamespace ? path.join('.llxprt', 'commands', 'clavix') : path.join('.llxprt', 'commands');
  }

  async detectProject(): Promise<boolean> {
    if (await FileSystem.exists('.llxprt')) {
      return true;
    }

    const homePath = path.join(this.getHomeDir(), '.llxprt');
    return await FileSystem.exists(homePath);
  }

  getCommandPath(): string {
    return this.directory;
  }

  getTargetFilename(name: string): string {
    const commandPath = this.getCommandPath();
    const namespaced = commandPath.endsWith(path.join('commands', 'clavix'));
    const baseName = namespaced ? name : `clavix-${name}`;
    return `${baseName}${this.fileExtension}`;
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
