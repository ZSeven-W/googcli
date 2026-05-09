import test from 'node:test';
import assert from 'node:assert/strict';

import { planCommand, planCommandBatch, formatPlan } from '../src/planner.js';

test('plans gmail search commands with readonly scope and preserved query', () => {
  const plan = planCommand('gmail search from:alice@example.com has:attachment');

  assert.equal(plan.product, 'gmail');
  assert.equal(plan.action, 'search');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/gmail.readonly']);
  assert.deepEqual(plan.parameters, {
    query: 'from:alice@example.com has:attachment'
  });
});

test('plans gmail send commands with send scope and quoted fields', () => {
  const plan = planCommand('gmail send to alice@example.com subject "Launch update" body "Draft is ready for review."');

  assert.equal(plan.product, 'gmail');
  assert.equal(plan.action, 'send');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/gmail.send']);
  assert.deepEqual(plan.parameters, {
    to: 'alice@example.com',
    subject: 'Launch update',
    body: 'Draft is ready for review.'
  });
});

test('plans gmail draft commands with compose scope and quoted fields', () => {
  const plan = planCommand('gmail draft to alice@example.com subject "Launch update" body "Draft is ready for review."');

  assert.equal(plan.product, 'gmail');
  assert.equal(plan.action, 'draft');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/gmail.compose']);
  assert.deepEqual(plan.parameters, {
    to: 'alice@example.com',
    subject: 'Launch update',
    body: 'Draft is ready for review.'
  });
});

test('plans gmail summarize commands with readonly scope and summary post-processing metadata', () => {
  const plan = planCommand('gmail summarize label:inbox newer_than:1d');

  assert.equal(plan.product, 'gmail');
  assert.equal(plan.action, 'summarize');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/gmail.readonly']);
  assert.deepEqual(plan.parameters, {
    query: 'label:inbox newer_than:1d'
  });
  assert.deepEqual(plan.postProcess, {
    kind: 'summary',
    target: 'messages'
  });
});

test('plans calendar create commands with title, start time, and duration', () => {
  const plan = planCommand('calendar create Team sync at 2026-04-20T15:00 for 45m');

  assert.equal(plan.product, 'calendar');
  assert.equal(plan.action, 'create');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/calendar.events']);
  assert.deepEqual(plan.parameters, {
    title: 'Team sync',
    start: '2026-04-20T15:00',
    durationMinutes: 45
  });
});

test('plans calendar list commands with readonly scope and date', () => {
  const plan = planCommand('calendar list on 2026-04-20');

  assert.equal(plan.product, 'calendar');
  assert.equal(plan.action, 'list');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/calendar.readonly']);
  assert.deepEqual(plan.parameters, {
    date: '2026-04-20'
  });
});

test('plans calendar delete commands with event id and write scope', () => {
  const plan = planCommand('calendar delete evt_12345');

  assert.equal(plan.product, 'calendar');
  assert.equal(plan.action, 'delete');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/calendar.events']);
  assert.deepEqual(plan.parameters, {
    eventId: 'evt_12345'
  });
});

test('plans calendar update commands with event id, title, start time, and duration', () => {
  const plan = planCommand('calendar update evt_12345 title "Team sync" at 2026-04-21T09:30 for 30m');

  assert.equal(plan.product, 'calendar');
  assert.equal(plan.action, 'update');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/calendar.events']);
  assert.deepEqual(plan.parameters, {
    eventId: 'evt_12345',
    title: 'Team sync',
    start: '2026-04-21T09:30',
    durationMinutes: 30
  });
});

test('plans drive upload commands with source path and destination folder', () => {
  const plan = planCommand('drive upload ./deck.pdf to /Sales');

  assert.equal(plan.product, 'drive');
  assert.equal(plan.action, 'upload');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/drive.file']);
  assert.deepEqual(plan.parameters, {
    sourcePath: './deck.pdf',
    destinationFolder: '/Sales'
  });
});

test('plans drive download commands with readonly scope and destination path', () => {
  const plan = planCommand('drive download 1AbCdEfGh to ./downloads/deck.pdf');

  assert.equal(plan.product, 'drive');
  assert.equal(plan.action, 'download');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/drive.readonly']);
  assert.deepEqual(plan.parameters, {
    fileId: '1AbCdEfGh',
    destinationPath: './downloads/deck.pdf'
  });
});

test('plans drive list commands with metadata readonly scope and folder target', () => {
  const plan = planCommand('drive list in /Sales/Q2 Pipeline');

  assert.equal(plan.product, 'drive');
  assert.equal(plan.action, 'list');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/drive.metadata.readonly']);
  assert.deepEqual(plan.parameters, {
    folder: '/Sales/Q2 Pipeline'
  });
});

test('plans drive mkdir commands with write scope and parent folder target', () => {
  const plan = planCommand('drive mkdir "Launch Assets" in /Sales/Q2 Pipeline');

  assert.equal(plan.product, 'drive');
  assert.equal(plan.action, 'mkdir');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/drive.file']);
  assert.deepEqual(plan.parameters, {
    folderName: 'Launch Assets',
    parentFolder: '/Sales/Q2 Pipeline'
  });
});

test('plans drive move commands with write scope and destination folder', () => {
  const plan = planCommand('drive move 1AbCdEfGh to /Sales/Archive');

  assert.equal(plan.product, 'drive');
  assert.equal(plan.action, 'move');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/drive.file']);
  assert.deepEqual(plan.parameters, {
    fileId: '1AbCdEfGh',
    destinationFolder: '/Sales/Archive'
  });
});

test('plans drive copy commands with write scope and destination folder', () => {
  const plan = planCommand('drive copy 1AbCdEfGh to /Sales/Templates');

  assert.equal(plan.product, 'drive');
  assert.equal(plan.action, 'copy');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/drive.file']);
  assert.deepEqual(plan.parameters, {
    fileId: '1AbCdEfGh',
    destinationFolder: '/Sales/Templates'
  });
});

test('plans drive rename commands with write scope and new file name', () => {
  const plan = planCommand('drive rename 1AbCdEfGh to "Q2 Launch Deck"');

  assert.equal(plan.product, 'drive');
  assert.equal(plan.action, 'rename');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/drive.file']);
  assert.deepEqual(plan.parameters, {
    fileId: '1AbCdEfGh',
    newName: 'Q2 Launch Deck'
  });
});

test('plans command batches into a deduplicated workspace bundle', () => {
  const bundle = planCommandBatch([
    'gmail search from:alice@example.com has:attachment',
    'calendar list on 2026-04-20',
    'gmail search label:inbox'
  ]);

  assert.deepEqual(bundle, {
    kind: 'workspace-plan',
    scopes: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/gmail.readonly'
    ],
    products: ['calendar', 'gmail'],
    commands: [
      {
        input: 'gmail search from:alice@example.com has:attachment',
        product: 'gmail',
        action: 'search',
        scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
        parameters: { query: 'from:alice@example.com has:attachment' }
      },
      {
        input: 'calendar list on 2026-04-20',
        product: 'calendar',
        action: 'list',
        scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
        parameters: { date: '2026-04-20' }
      },
      {
        input: 'gmail search label:inbox',
        product: 'gmail',
        action: 'search',
        scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
        parameters: { query: 'label:inbox' }
      }
    ]
  });
});

test('ignores blank lines and comments when planning command batches', () => {
  const bundle = planCommandBatch([
    '',
    '   ',
    '# daily workspace reset',
    'drive upload ./deck.pdf to /Sales'
  ]);

  assert.equal(bundle.commands.length, 1);
  assert.deepEqual(bundle.scopes, ['https://www.googleapis.com/auth/drive.file']);
  assert.deepEqual(bundle.products, ['drive']);
  assert.deepEqual(bundle.commands[0], {
    input: 'drive upload ./deck.pdf to /Sales',
    product: 'drive',
    action: 'upload',
    scopes: ['https://www.googleapis.com/auth/drive.file'],
    parameters: {
      sourcePath: './deck.pdf',
      destinationFolder: '/Sales'
    }
  });
});

test('plans contacts create commands with write scope and structured fields', () => {
  const plan = planCommand('contacts create "Alice Example" email alice@example.com');

  assert.equal(plan.product, 'contacts');
  assert.equal(plan.action, 'create');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/contacts']);
  assert.deepEqual(plan.parameters, {
    name: 'Alice Example',
    email: 'alice@example.com'
  });
});

test('plans contacts update commands with resource id, name, and email', () => {
  const plan = planCommand('contacts update people/c123 name "Alice Example" email alice@example.com');

  assert.equal(plan.product, 'contacts');
  assert.equal(plan.action, 'update');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/contacts']);
  assert.deepEqual(plan.parameters, {
    resourceId: 'people/c123',
    name: 'Alice Example',
    email: 'alice@example.com'
  });
});

test('plans contacts delete commands with resource id and write scope', () => {
  const plan = planCommand('contacts delete people/c123');

  assert.equal(plan.product, 'contacts');
  assert.equal(plan.action, 'delete');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/contacts']);
  assert.deepEqual(plan.parameters, {
    resourceId: 'people/c123'
  });
});

test('plans sheets append commands with spreadsheet, tab, values, and write scope', () => {
  const plan = planCommand('sheets append 1AbCdEfGh tab Pipeline values "Alice,Qualified,2026-04-21"');

  assert.equal(plan.product, 'sheets');
  assert.equal(plan.action, 'append');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/spreadsheets']);
  assert.deepEqual(plan.parameters, {
    spreadsheetId: '1AbCdEfGh',
    tab: 'Pipeline',
    values: ['Alice', 'Qualified', '2026-04-21']
  });
});

test('plans sheets read commands with spreadsheet, range, and readonly scope', () => {
  const plan = planCommand('sheets read 1AbCdEfGh range Pipeline!A2:C20');

  assert.equal(plan.product, 'sheets');
  assert.equal(plan.action, 'read');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/spreadsheets.readonly']);
  assert.deepEqual(plan.parameters, {
    spreadsheetId: '1AbCdEfGh',
    range: 'Pipeline!A2:C20'
  });
});

 test('plans sheets update commands with spreadsheet, range, values, and write scope', () => {
  const plan = planCommand('sheets update 1AbCdEfGh range Pipeline!B2:D2 values "Qualified,Proposal,2026-05-01"');

  assert.equal(plan.product, 'sheets');
  assert.equal(plan.action, 'update');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/spreadsheets']);
  assert.deepEqual(plan.parameters, {
    spreadsheetId: '1AbCdEfGh',
    range: 'Pipeline!B2:D2',
    values: ['Qualified', 'Proposal', '2026-05-01']
  });
});

test('plans docs create commands with title, content, and docs scope', () => {
  const plan = planCommand('docs create "Launch brief" content "Outline goals and blockers"');

  assert.equal(plan.product, 'docs');
  assert.equal(plan.action, 'create');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/documents']);
  assert.deepEqual(plan.parameters, {
    title: 'Launch brief',
    content: 'Outline goals and blockers'
  });
});

test('plans docs append commands with document id, content, and docs scope', () => {
  const plan = planCommand('docs append 1AbCdEfGh content "Add stakeholder decisions"');

  assert.equal(plan.product, 'docs');
  assert.equal(plan.action, 'append');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/documents']);
  assert.deepEqual(plan.parameters, {
    documentId: '1AbCdEfGh',
    content: 'Add stakeholder decisions'
  });
});

test('plans docs read commands with readonly scope and document id', () => {
  const plan = planCommand('docs read 1AbCdEfGh');

  assert.equal(plan.product, 'docs');
  assert.equal(plan.action, 'read');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/documents.readonly']);
  assert.deepEqual(plan.parameters, {
    documentId: '1AbCdEfGh'
  });
});

test('plans docs export commands with readonly scope and output path', () => {
  const plan = planCommand('docs export 1AbCdEfGh format pdf to ./exports/brief.pdf');

  assert.equal(plan.product, 'docs');
  assert.equal(plan.action, 'export');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/documents.readonly']);
  assert.deepEqual(plan.parameters, {
    documentId: '1AbCdEfGh',
    format: 'pdf',
    destinationPath: './exports/brief.pdf'
  });
});

test('plans tasks list commands with due date and readonly scope', () => {
  const plan = planCommand('tasks list due 2026-04-30');

  assert.equal(plan.product, 'tasks');
  assert.equal(plan.action, 'list');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/tasks.readonly']);
  assert.deepEqual(plan.parameters, {
    dueDate: '2026-04-30'
  });
});

test('plans tasks create commands with title and due date', () => {
  const plan = planCommand('tasks create "Prep launch checklist" due 2026-04-30');

  assert.equal(plan.product, 'tasks');
  assert.equal(plan.action, 'create');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/tasks']);
  assert.deepEqual(plan.parameters, {
    title: 'Prep launch checklist',
    dueDate: '2026-04-30'
  });
});

test('plans tasks update commands with task id, title, and due date', () => {
  const plan = planCommand('tasks update task-123 title "Prep launch checklist" due 2026-05-02');

  assert.equal(plan.product, 'tasks');
  assert.equal(plan.action, 'update');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/tasks']);
  assert.deepEqual(plan.parameters, {
    taskId: 'task-123',
    title: 'Prep launch checklist',
    dueDate: '2026-05-02'
  });
});

test('plans tasks complete commands with task id', () => {
  const plan = planCommand('tasks complete task-123');

  assert.equal(plan.product, 'tasks');
  assert.equal(plan.action, 'complete');
  assert.deepEqual(plan.scopes, ['https://www.googleapis.com/auth/tasks']);
  assert.deepEqual(plan.parameters, {
    taskId: 'task-123'
  });
});

test('formats plans as stable json output for the cli', () => {
  const formatted = formatPlan({
    product: 'contacts',
    action: 'lookup',
    scopes: ['https://www.googleapis.com/auth/contacts.readonly'],
    parameters: { query: 'Alice' }
  });

  assert.equal(
    formatted,
    '{\n  "product": "contacts",\n  "action": "lookup",\n  "scopes": [\n    "https://www.googleapis.com/auth/contacts.readonly"\n  ],\n  "parameters": {\n    "query": "Alice"\n  }\n}'
  );
});
