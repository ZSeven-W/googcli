# GoogCLI

GoogCLI is a local-first Google Workspace command planner. This first slice turns concise CLI instructions into structured action plans with the Google API scopes you would need to execute them later.

## MVP slices shipped in this repo

- `gmail search <query>` → Gmail search plan + readonly scope
- `gmail summarize <query>` → Gmail summary plan + readonly scope + post-process summary metadata
- `gmail send to <email> subject "<subject>" body "<body>"` → Gmail send plan + send scope
- `gmail draft to <email> subject "<subject>" body "<body>"` → Gmail draft plan + compose scope
- `calendar create <title> at <iso-datetime> for <minutes>m` → Calendar event creation plan
- `calendar list on <YYYY-MM-DD>` → Calendar agenda lookup plan + readonly scope
- `calendar delete <event-id>` → Calendar event deletion plan + write scope
- `calendar update <event-id> title "<title>" at <iso-datetime> for <minutes>m` → Calendar event reschedule/update plan + write scope
- `drive upload <path> to <folder>` → Drive upload plan
- `drive download <file-id> to <path>` → Drive download plan + readonly scope
- `drive list in <folder>` → Drive folder listing plan + metadata readonly scope
- `drive mkdir "<name>" in <folder>` → Drive subfolder creation plan + write scope
- `drive move <file-id> to <folder>` → Drive file move plan + write scope
- `drive copy <file-id> to <folder>` → Drive file duplication plan + write scope
- `drive rename <file-id> to "<name>"` → Drive file rename plan + write scope
- `contacts lookup <query>` → Contacts lookup plan
- `contacts create "<name>" email <email>` → Contacts create plan + write scope
- `contacts update <resource-id> name "<name>" email <email>` → Contacts update plan + write scope
- `contacts delete <resource-id>` → Contacts delete plan + write scope
- `sheets append <spreadsheet-id> tab <sheet-name> values "value1,value2"` → Sheets row append plan + write scope
- `sheets update <spreadsheet-id> range <A1-notation> values "value1,value2"` → Sheets range overwrite plan + write scope
- `sheets read <spreadsheet-id> range <A1-notation>` → Sheets range lookup plan + readonly scope
- `docs create "<title>" content "<text>"` → Google Docs draft plan + write scope
- `docs append <document-id> content "<text>"` → Google Docs append/update plan + write scope
- `docs read <document-id>` → Google Docs document-read plan + readonly scope
- `docs export <document-id> format <pdf|markdown|txt> to <path>` → Google Docs export plan + readonly scope
- `tasks list due <YYYY-MM-DD>` → Google Tasks due-date lookup plan + readonly scope
- `tasks create "<title>" due <YYYY-MM-DD>` → Google Tasks creation plan + write scope
- `tasks update <task-id> title "<title>" due <YYYY-MM-DD>` → Google Tasks reschedule/update plan + write scope
- `tasks complete <task-id>` → Google Tasks completion plan + write scope
- `planfile <path>` → batch multiple Google Workspace commands into one deduplicated `workspace-plan` bundle

## Usage

```bash
node src/cli.js plan "gmail search from:alice@example.com has:attachment"
node src/cli.js plan "gmail summarize label:inbox newer_than:1d"
node src/cli.js plan "gmail send to alice@example.com subject \"Launch update\" body \"Draft is ready for review.\""
node src/cli.js plan "gmail draft to alice@example.com subject \"Launch update\" body \"Draft is ready for review.\""
node src/cli.js plan "calendar create Team sync at 2026-04-20T15:00 for 45m"
node src/cli.js plan "calendar list on 2026-04-20"
node src/cli.js plan "calendar delete evt_12345"
node src/cli.js plan "calendar update evt_12345 title \"Team sync\" at 2026-04-21T09:30 for 30m"
node src/cli.js plan "drive upload ./deck.pdf to /Sales"
node src/cli.js plan "drive download 1AbCdEfGh to ./downloads/deck.pdf"
node src/cli.js plan "drive list in /Sales/Q2 Pipeline"
node src/cli.js plan "drive mkdir \"Launch Assets\" in /Sales/Q2 Pipeline"
node src/cli.js plan "drive move 1AbCdEfGh to /Sales/Archive"
node src/cli.js plan "drive copy 1AbCdEfGh to /Sales/Templates"
node src/cli.js plan "drive rename 1AbCdEfGh to \"Q2 Launch Deck\""
node src/cli.js plan "contacts lookup Alice"
node src/cli.js plan "contacts create \"Alice Example\" email alice@example.com"
node src/cli.js plan "contacts update people/c123 name \"Alice Example\" email alice@example.com"
node src/cli.js plan "contacts delete people/c123"
node src/cli.js plan "sheets append 1AbCdEfGh tab Pipeline values \"Alice,Qualified,2026-04-21\""
node src/cli.js plan "sheets update 1AbCdEfGh range Pipeline!B2:D2 values \"Qualified,Proposal,2026-05-01\""
node src/cli.js plan "sheets read 1AbCdEfGh range Pipeline!A2:C20"
node src/cli.js plan "docs create \"Launch brief\" content \"Outline goals and blockers\""
node src/cli.js plan "docs append 1AbCdEfGh content \"Add stakeholder decisions\""
node src/cli.js plan "docs read 1AbCdEfGh"
node src/cli.js plan "docs export 1AbCdEfGh format markdown to ./exports/brief.md"
node src/cli.js plan "tasks list due 2026-04-30"
node src/cli.js plan "tasks create \"Prep launch checklist\" due 2026-04-30"
node src/cli.js plan "tasks update task-123 title \"Prep launch checklist\" due 2026-05-02"
node src/cli.js plan "tasks complete task-123"
node src/cli.js planfile ./workspace.plan.txt
```

Example `workspace.plan.txt`:

```text
# morning sync
gmail search label:inbox newer_than:1d
calendar list on 2026-04-20
drive upload ./deck.pdf to /Sales
```

`planfile` emits one JSON bundle with:

- `commands` — each parsed command with preserved input
- `scopes` — deduplicated scope list across the bundle
- `products` — deduplicated product list across the bundle

Example single-command output:

```json
{
  "product": "gmail",
  "action": "search",
  "scopes": [
    "https://www.googleapis.com/auth/gmail.readonly"
  ],
  "parameters": {
    "query": "from:alice@example.com has:attachment"
  }
}
```

## Validate

```bash
npm test
node src/cli.js plan "gmail summarize label:inbox newer_than:1d"
node src/cli.js plan "gmail send to alice@example.com subject \"Launch update\" body \"Draft is ready for review.\""
node src/cli.js plan "gmail draft to alice@example.com subject \"Launch update\" body \"Draft is ready for review.\""
node src/cli.js plan "calendar delete evt_12345"
node src/cli.js plan "calendar update evt_12345 title \"Team sync\" at 2026-04-21T09:30 for 30m"
node src/cli.js plan "drive list in /Sales/Q2 Pipeline"
node src/cli.js plan "drive mkdir \"Launch Assets\" in /Sales/Q2 Pipeline"
node src/cli.js plan "drive move 1AbCdEfGh to /Sales/Archive"
node src/cli.js plan "drive copy 1AbCdEfGh to /Sales/Templates"
node src/cli.js plan "drive rename 1AbCdEfGh to \"Q2 Launch Deck\""
node src/cli.js plan "contacts create \"Alice Example\" email alice@example.com"
node src/cli.js plan "contacts update people/c123 name \"Alice Example\" email alice@example.com"
node src/cli.js plan "contacts delete people/c123"
node src/cli.js plan "sheets append 1AbCdEfGh tab Pipeline values \"Alice,Qualified,2026-04-21\""
node src/cli.js plan "sheets update 1AbCdEfGh range Pipeline!B2:D2 values \"Qualified,Proposal,2026-05-01\""
node src/cli.js plan "docs create \"Launch brief\" content \"Outline goals and blockers\""
node src/cli.js plan "docs append 1AbCdEfGh content \"Add stakeholder decisions\""
node src/cli.js plan "docs read 1AbCdEfGh"
node src/cli.js plan "docs export 1AbCdEfGh format pdf to ./exports/brief.pdf"
node src/cli.js plan "tasks list due 2026-04-30"
node src/cli.js plan "tasks create \"Prep launch checklist\" due 2026-04-30"
node src/cli.js plan "tasks update task-123 title \"Prep launch checklist\" due 2026-05-02"
node src/cli.js plan "tasks complete task-123"
node src/cli.js planfile ./workspace.plan.txt
```
