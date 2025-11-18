import { describe, it, expect } from '@jest/globals';
import { parseTomlSlashCommand } from '../../src/utils/toml-templates';

describe('parseTomlSlashCommand', () => {
  it('normalizes BOM and Windows line endings', () => {
    const template = '\ufeffdescription = "Test"\r\nprompt = """\r\nLine A\r\nLine B\r\n"""\r\n';
    const result = parseTomlSlashCommand(template, 'test', 'provider');

    expect(result.description).toBe('Test');
    expect(result.prompt).toBe('Line A\nLine B');
  });

  it('throws when prompt block is missing', () => {
    const template = 'description = "Missing"';
    expect(() => parseTomlSlashCommand(template, 'missing', 'provider')).toThrow(/missing a prompt = """/i);
  });

  it('throws when prompt block is unterminated', () => {
    const template = 'description = "Incomplete"\nprompt = """Line';
    expect(() => parseTomlSlashCommand(template, 'unterminated', 'provider')).toThrow(/does not terminate its prompt/i);
  });

  it('preserves literal lines inside prompt body', () => {
    const template = `description = "Desc"
prompt = """
description = "should remove"
prompt = "should remove"
Actual content
"""`;
    const result = parseTomlSlashCommand(template, 'strip', 'provider');
    expect(result.prompt).toBe('description = "should remove"\nprompt = "should remove"\nActual content');
  });

  it('preserves intentional indentation inside prompt body', () => {
    const template = `description = "Desc"
prompt = """


  Content with spaces   
\n\n
"""`;
    const result = parseTomlSlashCommand(template, 'trim', 'provider');
    expect(result.prompt).toBe('  Content with spaces');
  });

  it('handles missing description field gracefully', () => {
    const template = 'prompt = """Hello"""';
    const result = parseTomlSlashCommand(template, 'node-description', 'provider');
    expect(result.description).toBe('');
    expect(result.prompt).toBe('Hello');
  });
});
