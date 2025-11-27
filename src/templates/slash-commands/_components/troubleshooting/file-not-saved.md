### Issue: {{OUTPUT_TYPE}} Not Saved

**Error: Cannot create directory**
```bash
mkdir -p .clavix/outputs/prompts
```

**Error: Prompt file has invalid frontmatter**
- Re-save the file with valid YAML frontmatter
- Ensure id, timestamp, and executed fields are present in frontmatter

**Error: Duplicate {{OUTPUT_TYPE}} ID**
- Generate a new ID with a different timestamp or random suffix
- Retry the save operation with the new ID

**Error: File write permission denied**
- Check directory permissions
- Ensure `.clavix/` directory is writable
- Try creating the directory structure again
