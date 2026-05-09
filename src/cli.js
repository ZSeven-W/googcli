#!/usr/bin/env node
import { readFileSync } from 'node:fs';

import { formatPlan, planCommand, planCommandBatch } from './planner.js';

const [, , commandName, ...rest] = process.argv;

if (commandName === 'plan' && rest.length > 0) {
  const input = rest.join(' ');
  const plan = planCommand(input);
  process.stdout.write(`${formatPlan(plan)}\n`);
  process.exit(0);
}

if (commandName === 'planfile' && rest.length === 1) {
  const fileContents = readFileSync(rest[0], 'utf8');
  const bundle = planCommandBatch(fileContents.split(/\r?\n/));
  process.stdout.write(`${formatPlan(bundle)}\n`);
  process.exit(0);
}

console.error('Usage: googcli plan "gmail search from:alice@example.com"\n       googcli plan "gmail summarize label:inbox newer_than:1d"\n       googcli plan "gmail send to alice@example.com subject \"Launch update\" body \"Draft is ready for review.\""\n       googcli plan "gmail draft to alice@example.com subject \"Launch update\" body \"Draft is ready for review.\""\n       googcli plan "calendar delete evt_12345"\n       googcli plan "calendar update evt_12345 title \"Team sync\" at 2026-04-21T09:30 for 30m"\n       googcli plan "drive list in /Sales/Q2 Pipeline"\n       googcli plan "drive mkdir \"Launch Assets\" in /Sales/Q2 Pipeline"\n       googcli plan "drive move 1AbCdEfGh to /Sales/Archive"\n       googcli plan "drive copy 1AbCdEfGh to /Sales/Templates"\n       googcli plan "drive rename 1AbCdEfGh to \"Q2 Launch Deck\""\n       googcli plan "contacts create \"Alice Example\" email alice@example.com"\n       googcli plan "contacts update people/c123 name \"Alice Example\" email alice@example.com"\n       googcli plan "contacts delete people/c123"\n       googcli plan "sheets append 1AbCdEfGh tab Pipeline values \"Alice,Qualified,2026-04-21\""\n       googcli plan "sheets update 1AbCdEfGh range Pipeline!B2:D2 values \"Qualified,Proposal,2026-05-01\""\n       googcli plan "docs create \"Launch brief\" content \"Outline goals and blockers\""\n       googcli plan "docs append 1AbCdEfGh content \"Add stakeholder decisions\""\n       googcli plan "docs read 1AbCdEfGh"\n       googcli plan "docs export 1AbCdEfGh format markdown to ./exports/brief.md"\n       googcli plan "tasks list due 2026-04-30"\n       googcli plan "tasks create \"Prep launch checklist\" due 2026-04-30"\n       googcli plan "tasks update task-123 title \"Prep launch checklist\" due 2026-05-02"\n       googcli plan "tasks complete task-123"\n       googcli planfile ./workspace.plan.txt');
process.exit(1);
