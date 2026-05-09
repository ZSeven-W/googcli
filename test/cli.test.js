import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

test('planfile emits a workspace bundle from a text file', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'googcli-'));
  const planPath = join(tempDir, 'workspace.plan.txt');
  writeFileSync(
    planPath,
    [
      '# Morning triage',
      'gmail search label:inbox newer_than:1d',
      '',
      'calendar list on 2026-04-20'
    ].join('\n')
  );

  const output = execFileSync(process.execPath, ['src/cli.js', 'planfile', planPath], {
    cwd: '/Users/fini/.openclaw/workspace-coder/googcli',
    encoding: 'utf8'
  });

  assert.deepEqual(JSON.parse(output), {
    kind: 'workspace-plan',
    scopes: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/gmail.readonly'
    ],
    products: ['calendar', 'gmail'],
    commands: [
      {
        input: 'gmail search label:inbox newer_than:1d',
        product: 'gmail',
        action: 'search',
        scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
        parameters: {
          query: 'label:inbox newer_than:1d'
        }
      },
      {
        input: 'calendar list on 2026-04-20',
        product: 'calendar',
        action: 'list',
        scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
        parameters: {
          date: '2026-04-20'
        }
      }
    ]
  });
});

test('plan emits json for sheets append commands', () => {
  const output = execFileSync(process.execPath, ['src/cli.js', 'plan', 'sheets append 1AbCdEfGh tab Pipeline values "Alice,Qualified,2026-04-21"'], {
    cwd: '/Users/fini/.openclaw/workspace-coder/googcli',
    encoding: 'utf8'
  });

  assert.deepEqual(JSON.parse(output), {
    product: 'sheets',
    action: 'append',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    parameters: {
      spreadsheetId: '1AbCdEfGh',
      tab: 'Pipeline',
      values: ['Alice', 'Qualified', '2026-04-21']
    }
  });
});

test('plan emits json for sheets update commands', () => {
  const output = execFileSync(process.execPath, ['src/cli.js', 'plan', 'sheets update 1AbCdEfGh range Pipeline!B2:D2 values "Qualified,Proposal,2026-05-01"'], {
    cwd: '/Users/fini/.openclaw/workspace-coder/googcli',
    encoding: 'utf8'
  });

  assert.deepEqual(JSON.parse(output), {
    product: 'sheets',
    action: 'update',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    parameters: {
      spreadsheetId: '1AbCdEfGh',
      range: 'Pipeline!B2:D2',
      values: ['Qualified', 'Proposal', '2026-05-01']
    }
  });
});

test('plan emits json for contacts create commands', () => {
  const output = execFileSync(process.execPath, ['src/cli.js', 'plan', 'contacts create "Alice Example" email alice@example.com'], {
    cwd: '/Users/fini/.openclaw/workspace-coder/googcli',
    encoding: 'utf8'
  });

  assert.deepEqual(JSON.parse(output), {
    product: 'contacts',
    action: 'create',
    scopes: ['https://www.googleapis.com/auth/contacts'],
    parameters: {
      name: 'Alice Example',
      email: 'alice@example.com'
    }
  });
});

test('plan emits json for contacts update commands', () => {
  const output = execFileSync(process.execPath, ['src/cli.js', 'plan', 'contacts update people/c123 name "Alice Example" email alice@example.com'], {
    cwd: '/Users/fini/.openclaw/workspace-coder/googcli',
    encoding: 'utf8'
  });

  assert.deepEqual(JSON.parse(output), {
    product: 'contacts',
    action: 'update',
    scopes: ['https://www.googleapis.com/auth/contacts'],
    parameters: {
      resourceId: 'people/c123',
      name: 'Alice Example',
      email: 'alice@example.com'
    }
  });
});

test('plan emits json for contacts delete commands', () => {
  const output = execFileSync(process.execPath, ['src/cli.js', 'plan', 'contacts delete people/c123'], {
    cwd: '/Users/fini/.openclaw/workspace-coder/googcli',
    encoding: 'utf8'
  });

  assert.deepEqual(JSON.parse(output), {
    product: 'contacts',
    action: 'delete',
    scopes: ['https://www.googleapis.com/auth/contacts'],
    parameters: {
      resourceId: 'people/c123'
    }
  });
});

test('plan emits json for gmail summarize commands', () => {
  const output = execFileSync(process.execPath, ['src/cli.js', 'plan', 'gmail summarize label:inbox newer_than:1d'], {
    cwd: '/Users/fini/.openclaw/workspace-coder/googcli',
    encoding: 'utf8'
  });

  assert.deepEqual(JSON.parse(output), {
    product: 'gmail',
    action: 'summarize',
    scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
    parameters: {
      query: 'label:inbox newer_than:1d'
    },
    postProcess: {
      kind: 'summary',
      target: 'messages'
    }
  });
});

test('plan emits json for gmail draft commands', () => {
  const output = execFileSync(process.execPath, ['src/cli.js', 'plan', 'gmail draft to alice@example.com subject "Launch update" body "Draft is ready for review."'], {
    cwd: '/Users/fini/.openclaw/workspace-coder/googcli',
    encoding: 'utf8'
  });

  assert.deepEqual(JSON.parse(output), {
    product: 'gmail',
    action: 'draft',
    scopes: ['https://www.googleapis.com/auth/gmail.compose'],
    parameters: {
      to: 'alice@example.com',
      subject: 'Launch update',
      body: 'Draft is ready for review.'
    }
  });
});

test('plan emits json for docs append commands', () => {
  const output = execFileSync(process.execPath, ['src/cli.js', 'plan', 'docs append 1AbCdEfGh content "Add stakeholder decisions"'], {
    cwd: '/Users/fini/.openclaw/workspace-coder/googcli',
    encoding: 'utf8'
  });

  assert.deepEqual(JSON.parse(output), {
    product: 'docs',
    action: 'append',
    scopes: ['https://www.googleapis.com/auth/documents'],
    parameters: {
      documentId: '1AbCdEfGh',
      content: 'Add stakeholder decisions'
    }
  });
});

test('plan emits json for docs read commands', () => {
  const output = execFileSync(process.execPath, ['src/cli.js', 'plan', 'docs read 1AbCdEfGh'], {
    cwd: '/Users/fini/.openclaw/workspace-coder/googcli',
    encoding: 'utf8'
  });

  assert.deepEqual(JSON.parse(output), {
    product: 'docs',
    action: 'read',
    scopes: ['https://www.googleapis.com/auth/documents.readonly'],
    parameters: {
      documentId: '1AbCdEfGh'
    }
  });
});

test('plan emits json for docs export commands', () => {
  const output = execFileSync(process.execPath, ['src/cli.js', 'plan', 'docs export 1AbCdEfGh format markdown to ./exports/brief.md'], {
    cwd: '/Users/fini/.openclaw/workspace-coder/googcli',
    encoding: 'utf8'
  });

  assert.deepEqual(JSON.parse(output), {
    product: 'docs',
    action: 'export',
    scopes: ['https://www.googleapis.com/auth/documents.readonly'],
    parameters: {
      documentId: '1AbCdEfGh',
      format: 'markdown',
      destinationPath: './exports/brief.md'
    }
  });
});

test('plan emits json for drive list commands', () => {
  const output = execFileSync(process.execPath, ['src/cli.js', 'plan', 'drive list in /Sales/Q2 Pipeline'], {
    cwd: '/Users/fini/.openclaw/workspace-coder/googcli',
    encoding: 'utf8'
  });

  assert.deepEqual(JSON.parse(output), {
    product: 'drive',
    action: 'list',
    scopes: ['https://www.googleapis.com/auth/drive.metadata.readonly'],
    parameters: {
      folder: '/Sales/Q2 Pipeline'
    }
  });
});

test('plan emits json for drive mkdir commands', () => {
  const output = execFileSync(process.execPath, ['src/cli.js', 'plan', 'drive mkdir "Launch Assets" in /Sales/Q2 Pipeline'], {
    cwd: '/Users/fini/.openclaw/workspace-coder/googcli',
    encoding: 'utf8'
  });

  assert.deepEqual(JSON.parse(output), {
    product: 'drive',
    action: 'mkdir',
    scopes: ['https://www.googleapis.com/auth/drive.file'],
    parameters: {
      folderName: 'Launch Assets',
      parentFolder: '/Sales/Q2 Pipeline'
    }
  });
});

test('plan emits json for drive move commands', () => {
  const output = execFileSync(process.execPath, ['src/cli.js', 'plan', 'drive move 1AbCdEfGh to /Sales/Archive'], {
    cwd: '/Users/fini/.openclaw/workspace-coder/googcli',
    encoding: 'utf8'
  });

  assert.deepEqual(JSON.parse(output), {
    product: 'drive',
    action: 'move',
    scopes: ['https://www.googleapis.com/auth/drive.file'],
    parameters: {
      fileId: '1AbCdEfGh',
      destinationFolder: '/Sales/Archive'
    }
  });
});

test('plan emits json for drive copy commands', () => {
  const output = execFileSync(process.execPath, ['src/cli.js', 'plan', 'drive copy 1AbCdEfGh to /Sales/Templates'], {
    cwd: '/Users/fini/.openclaw/workspace-coder/googcli',
    encoding: 'utf8'
  });

  assert.deepEqual(JSON.parse(output), {
    product: 'drive',
    action: 'copy',
    scopes: ['https://www.googleapis.com/auth/drive.file'],
    parameters: {
      fileId: '1AbCdEfGh',
      destinationFolder: '/Sales/Templates'
    }
  });
});

test('plan emits json for drive rename commands', () => {
  const output = execFileSync(process.execPath, ['src/cli.js', 'plan', 'drive rename 1AbCdEfGh to "Q2 Launch Deck"'], {
    cwd: '/Users/fini/.openclaw/workspace-coder/googcli',
    encoding: 'utf8'
  });

  assert.deepEqual(JSON.parse(output), {
    product: 'drive',
    action: 'rename',
    scopes: ['https://www.googleapis.com/auth/drive.file'],
    parameters: {
      fileId: '1AbCdEfGh',
      newName: 'Q2 Launch Deck'
    }
  });
});

test('plan emits json for calendar update commands', () => {
  const output = execFileSync(process.execPath, ['src/cli.js', 'plan', 'calendar update evt_12345 title "Team sync" at 2026-04-21T09:30 for 30m'], {
    cwd: '/Users/fini/.openclaw/workspace-coder/googcli',
    encoding: 'utf8'
  });

  assert.deepEqual(JSON.parse(output), {
    product: 'calendar',
    action: 'update',
    scopes: ['https://www.googleapis.com/auth/calendar.events'],
    parameters: {
      eventId: 'evt_12345',
      title: 'Team sync',
      start: '2026-04-21T09:30',
      durationMinutes: 30
    }
  });
});

test('plan emits json for tasks create commands', () => {
  const output = execFileSync(process.execPath, ['src/cli.js', 'plan', 'tasks create "Prep launch checklist" due 2026-04-30'], {
    cwd: '/Users/fini/.openclaw/workspace-coder/googcli',
    encoding: 'utf8'
  });

  assert.deepEqual(JSON.parse(output), {
    product: 'tasks',
    action: 'create',
    scopes: ['https://www.googleapis.com/auth/tasks'],
    parameters: {
      title: 'Prep launch checklist',
      dueDate: '2026-04-30'
    }
  });
});

test('plan emits json for tasks update commands', () => {
  const output = execFileSync(process.execPath, ['src/cli.js', 'plan', 'tasks update task-123 title "Prep launch checklist" due 2026-05-02'], {
    cwd: '/Users/fini/.openclaw/workspace-coder/googcli',
    encoding: 'utf8'
  });

  assert.deepEqual(JSON.parse(output), {
    product: 'tasks',
    action: 'update',
    scopes: ['https://www.googleapis.com/auth/tasks'],
    parameters: {
      taskId: 'task-123',
      title: 'Prep launch checklist',
      dueDate: '2026-05-02'
    }
  });
});
