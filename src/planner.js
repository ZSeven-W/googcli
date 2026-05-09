const SCOPES = {
  gmail: {
    search: 'https://www.googleapis.com/auth/gmail.readonly',
    send: 'https://www.googleapis.com/auth/gmail.send',
    draft: 'https://www.googleapis.com/auth/gmail.compose'
  },
  calendar: {
    create: 'https://www.googleapis.com/auth/calendar.events',
    list: 'https://www.googleapis.com/auth/calendar.readonly'
  },
  drive: {
    upload: 'https://www.googleapis.com/auth/drive.file',
    download: 'https://www.googleapis.com/auth/drive.readonly',
    list: 'https://www.googleapis.com/auth/drive.metadata.readonly'
  },
  contacts: {
    lookup: 'https://www.googleapis.com/auth/contacts.readonly',
    create: 'https://www.googleapis.com/auth/contacts'
  },
  sheets: {
    append: 'https://www.googleapis.com/auth/spreadsheets',
    update: 'https://www.googleapis.com/auth/spreadsheets',
    read: 'https://www.googleapis.com/auth/spreadsheets.readonly'
  },
  docs: {
    create: 'https://www.googleapis.com/auth/documents',
    append: 'https://www.googleapis.com/auth/documents',
    read: 'https://www.googleapis.com/auth/documents.readonly',
    export: 'https://www.googleapis.com/auth/documents.readonly'
  },
  tasks: {
    list: 'https://www.googleapis.com/auth/tasks.readonly',
    create: 'https://www.googleapis.com/auth/tasks',
    update: 'https://www.googleapis.com/auth/tasks',
    complete: 'https://www.googleapis.com/auth/tasks'
  }
};

function planGmail(tokens, input) {
  if (tokens[0] === 'search') {
    const query = tokens.slice(1).join(' ').trim();
    if (!query) {
      throw new Error('gmail search requires a query');
    }

    return {
      product: 'gmail',
      action: 'search',
      scopes: [SCOPES.gmail.search],
      parameters: { query }
    };
  }

  if (tokens[0] === 'summarize') {
    const query = tokens.slice(1).join(' ').trim();
    if (!query) {
      throw new Error('gmail summarize requires a query');
    }

    return {
      product: 'gmail',
      action: 'summarize',
      scopes: [SCOPES.gmail.search],
      parameters: { query },
      postProcess: {
        kind: 'summary',
        target: 'messages'
      }
    };
  }

  const sendMatch = input.match(/^send\s+to\s+(\S+)\s+subject\s+"([^"]+)"\s+body\s+"([^"]+)"$/i);
  if (sendMatch) {
    return {
      product: 'gmail',
      action: 'send',
      scopes: [SCOPES.gmail.send],
      parameters: {
        to: sendMatch[1],
        subject: sendMatch[2],
        body: sendMatch[3]
      }
    };
  }

  const draftMatch = input.match(/^draft\s+to\s+(\S+)\s+subject\s+"([^"]+)"\s+body\s+"([^"]+)"$/i);
  if (draftMatch) {
    return {
      product: 'gmail',
      action: 'draft',
      scopes: [SCOPES.gmail.draft],
      parameters: {
        to: draftMatch[1],
        subject: draftMatch[2],
        body: draftMatch[3]
      }
    };
  }

  throw new Error('Unsupported gmail command. Try: gmail search <query> OR gmail summarize <query> OR gmail send to <email> subject "<subject>" body "<body>" OR gmail draft to <email> subject "<subject>" body "<body>"');
}

function planCalendar(input) {
  const createMatch = input.match(/^create\s+(.+?)\s+at\s+(\S+)\s+for\s+(\d+)m$/i);
  if (createMatch) {
    return {
      product: 'calendar',
      action: 'create',
      scopes: [SCOPES.calendar.create],
      parameters: {
        title: createMatch[1],
        start: createMatch[2],
        durationMinutes: Number.parseInt(createMatch[3], 10)
      }
    };
  }

  const listMatch = input.match(/^list\s+on\s+(\d{4}-\d{2}-\d{2})$/i);
  if (listMatch) {
    return {
      product: 'calendar',
      action: 'list',
      scopes: [SCOPES.calendar.list],
      parameters: {
        date: listMatch[1]
      }
    };
  }

  const deleteMatch = input.match(/^delete\s+(\S+)$/i);
  if (deleteMatch) {
    return {
      product: 'calendar',
      action: 'delete',
      scopes: [SCOPES.calendar.create],
      parameters: {
        eventId: deleteMatch[1]
      }
    };
  }

  const updateMatch = input.match(/^update\s+(\S+)\s+title\s+"([^"]+)"\s+at\s+(\S+)\s+for\s+(\d+)m$/i);
  if (updateMatch) {
    return {
      product: 'calendar',
      action: 'update',
      scopes: [SCOPES.calendar.create],
      parameters: {
        eventId: updateMatch[1],
        title: updateMatch[2],
        start: updateMatch[3],
        durationMinutes: Number.parseInt(updateMatch[4], 10)
      }
    };
  }

  throw new Error('Unsupported calendar command. Try: calendar create <title> at <iso-datetime> for <minutes>m OR calendar list on <YYYY-MM-DD> OR calendar delete <event-id> OR calendar update <event-id> title "<title>" at <iso-datetime> for <minutes>m');
}

function planDrive(input) {
  const uploadMatch = input.match(/^upload\s+(\S+)\s+to\s+(.+)$/i);
  if (uploadMatch) {
    return {
      product: 'drive',
      action: 'upload',
      scopes: [SCOPES.drive.upload],
      parameters: {
        sourcePath: uploadMatch[1],
        destinationFolder: uploadMatch[2]
      }
    };
  }

  const downloadMatch = input.match(/^download\s+(\S+)\s+to\s+(\S+)$/i);
  if (downloadMatch) {
    return {
      product: 'drive',
      action: 'download',
      scopes: [SCOPES.drive.download],
      parameters: {
        fileId: downloadMatch[1],
        destinationPath: downloadMatch[2]
      }
    };
  }

  const listMatch = input.match(/^list\s+in\s+(.+)$/i);
  if (listMatch) {
    return {
      product: 'drive',
      action: 'list',
      scopes: [SCOPES.drive.list],
      parameters: {
        folder: listMatch[1].trim()
      }
    };
  }

  const mkdirMatch = input.match(/^mkdir\s+"([^"]+)"\s+in\s+(.+)$/i);
  if (mkdirMatch) {
    return {
      product: 'drive',
      action: 'mkdir',
      scopes: [SCOPES.drive.upload],
      parameters: {
        folderName: mkdirMatch[1],
        parentFolder: mkdirMatch[2].trim()
      }
    };
  }

  const moveMatch = input.match(/^move\s+(\S+)\s+to\s+(.+)$/i);
  if (moveMatch) {
    return {
      product: 'drive',
      action: 'move',
      scopes: [SCOPES.drive.upload],
      parameters: {
        fileId: moveMatch[1],
        destinationFolder: moveMatch[2].trim()
      }
    };
  }

  const copyMatch = input.match(/^copy\s+(\S+)\s+to\s+(.+)$/i);
  if (copyMatch) {
    return {
      product: 'drive',
      action: 'copy',
      scopes: [SCOPES.drive.upload],
      parameters: {
        fileId: copyMatch[1],
        destinationFolder: copyMatch[2].trim()
      }
    };
  }

  const renameMatch = input.match(/^rename\s+(\S+)\s+to\s+"([^"]+)"$/i);
  if (renameMatch) {
    return {
      product: 'drive',
      action: 'rename',
      scopes: [SCOPES.drive.upload],
      parameters: {
        fileId: renameMatch[1],
        newName: renameMatch[2]
      }
    };
  }

  throw new Error('Unsupported drive command. Try: drive upload <path> to <folder> OR drive download <file-id> to <path> OR drive list in <folder> OR drive mkdir "<name>" in <folder> OR drive move <file-id> to <folder> OR drive copy <file-id> to <folder> OR drive rename <file-id> to "<name>"');
}

function planContacts(tokens, input) {
  if (tokens[0] === 'lookup') {
    const query = tokens.slice(1).join(' ').trim();
    if (!query) {
      throw new Error('contacts lookup requires a query');
    }

    return {
      product: 'contacts',
      action: 'lookup',
      scopes: [SCOPES.contacts.lookup],
      parameters: { query }
    };
  }

  const createMatch = input.match(/^create\s+"([^"]+)"\s+email\s+(\S+)$/i);
  if (createMatch) {
    return {
      product: 'contacts',
      action: 'create',
      scopes: [SCOPES.contacts.create],
      parameters: {
        name: createMatch[1],
        email: createMatch[2]
      }
    };
  }

  const updateMatch = input.match(/^update\s+(\S+)\s+name\s+"([^"]+)"\s+email\s+(\S+)$/i);
  if (updateMatch) {
    return {
      product: 'contacts',
      action: 'update',
      scopes: [SCOPES.contacts.create],
      parameters: {
        resourceId: updateMatch[1],
        name: updateMatch[2],
        email: updateMatch[3]
      }
    };
  }

  const deleteMatch = input.match(/^delete\s+(\S+)$/i);
  if (deleteMatch) {
    return {
      product: 'contacts',
      action: 'delete',
      scopes: [SCOPES.contacts.create],
      parameters: {
        resourceId: deleteMatch[1]
      }
    };
  }

  throw new Error('Unsupported contacts command. Try: contacts lookup <query> OR contacts create "<name>" email <email> OR contacts update <resource-id> name "<name>" email <email> OR contacts delete <resource-id>');
}

function planSheets(input) {
  const appendMatch = input.match(/^append\s+(\S+)\s+tab\s+(.+?)\s+values\s+"([^"]+)"$/i);
  if (appendMatch) {
    return {
      product: 'sheets',
      action: 'append',
      scopes: [SCOPES.sheets.append],
      parameters: {
        spreadsheetId: appendMatch[1],
        tab: appendMatch[2],
        values: appendMatch[3].split(',').map((value) => value.trim())
      }
    };
  }

  const updateMatch = input.match(/^update\s+(\S+)\s+range\s+(\S+)\s+values\s+"([^"]+)"$/i);
  if (updateMatch) {
    return {
      product: 'sheets',
      action: 'update',
      scopes: [SCOPES.sheets.update],
      parameters: {
        spreadsheetId: updateMatch[1],
        range: updateMatch[2],
        values: updateMatch[3].split(',').map((value) => value.trim())
      }
    };
  }

  const readMatch = input.match(/^read\s+(\S+)\s+range\s+(\S+)$/i);
  if (readMatch) {
    return {
      product: 'sheets',
      action: 'read',
      scopes: [SCOPES.sheets.read],
      parameters: {
        spreadsheetId: readMatch[1],
        range: readMatch[2]
      }
    };
  }

  throw new Error('Unsupported sheets command. Try: sheets append <spreadsheet-id> tab <sheet-name> values "value1,value2" OR sheets update <spreadsheet-id> range <A1-notation> values "value1,value2" OR sheets read <spreadsheet-id> range <A1-notation>');
}

function planDocs(input) {
  const createMatch = input.match(/^create\s+"([^"]+)"\s+content\s+"([^"]+)"$/i);
  if (createMatch) {
    return {
      product: 'docs',
      action: 'create',
      scopes: [SCOPES.docs.create],
      parameters: {
        title: createMatch[1],
        content: createMatch[2]
      }
    };
  }

  const appendMatch = input.match(/^append\s+(\S+)\s+content\s+"([^"]+)"$/i);
  if (appendMatch) {
    return {
      product: 'docs',
      action: 'append',
      scopes: [SCOPES.docs.append],
      parameters: {
        documentId: appendMatch[1],
        content: appendMatch[2]
      }
    };
  }

  const readMatch = input.match(/^read\s+(\S+)$/i);
  if (readMatch) {
    return {
      product: 'docs',
      action: 'read',
      scopes: [SCOPES.docs.read],
      parameters: {
        documentId: readMatch[1]
      }
    };
  }

  const exportMatch = input.match(/^export\s+(\S+)\s+format\s+(\S+)\s+to\s+(\S+)$/i);
  if (exportMatch) {
    return {
      product: 'docs',
      action: 'export',
      scopes: [SCOPES.docs.export],
      parameters: {
        documentId: exportMatch[1],
        format: exportMatch[2].toLowerCase(),
        destinationPath: exportMatch[3]
      }
    };
  }

  throw new Error('Unsupported docs command. Try: docs create "<title>" content "<text>" OR docs append <document-id> content "<text>" OR docs read <document-id> OR docs export <document-id> format <pdf|markdown|txt> to <path>');
}

function planTasks(input) {
  const listMatch = input.match(/^list\s+due\s+(\d{4}-\d{2}-\d{2})$/i);
  if (listMatch) {
    return {
      product: 'tasks',
      action: 'list',
      scopes: [SCOPES.tasks.list],
      parameters: {
        dueDate: listMatch[1]
      }
    };
  }

  const createMatch = input.match(/^create\s+"([^"]+)"\s+due\s+(\d{4}-\d{2}-\d{2})$/i);
  if (createMatch) {
    return {
      product: 'tasks',
      action: 'create',
      scopes: [SCOPES.tasks.create],
      parameters: {
        title: createMatch[1],
        dueDate: createMatch[2]
      }
    };
  }

  const updateMatch = input.match(/^update\s+(\S+)\s+title\s+"([^"]+)"\s+due\s+(\d{4}-\d{2}-\d{2})$/i);
  if (updateMatch) {
    return {
      product: 'tasks',
      action: 'update',
      scopes: [SCOPES.tasks.update],
      parameters: {
        taskId: updateMatch[1],
        title: updateMatch[2],
        dueDate: updateMatch[3]
      }
    };
  }

  const completeMatch = input.match(/^complete\s+(\S+)$/i);
  if (completeMatch) {
    return {
      product: 'tasks',
      action: 'complete',
      scopes: [SCOPES.tasks.complete],
      parameters: {
        taskId: completeMatch[1]
      }
    };
  }

  throw new Error('Unsupported tasks command. Try: tasks list due <YYYY-MM-DD> OR tasks create "<title>" due <YYYY-MM-DD> OR tasks update <task-id> title "<title>" due <YYYY-MM-DD> OR tasks complete <task-id>');
}

export function planCommand(input) {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('Command text is required');
  }

  const [product, ...rest] = trimmed.split(/\s+/);
  const remainder = rest.join(' ');

  switch (product) {
    case 'gmail':
      return planGmail(rest, remainder);
    case 'calendar':
      return planCalendar(remainder);
    case 'drive':
      return planDrive(remainder);
    case 'contacts':
      return planContacts(rest, remainder);
    case 'sheets':
      return planSheets(remainder);
    case 'docs':
      return planDocs(remainder);
    case 'tasks':
      return planTasks(remainder);
    default:
      throw new Error(`Unsupported Google product: ${product}`);
  }
}

export function planCommandBatch(inputs) {
  const commands = inputs
    .map((input) => input.trim())
    .filter((input) => input && !input.startsWith('#'))
    .map((input) => ({
      input,
      ...planCommand(input)
    }));

  const scopes = [...new Set(commands.flatMap((command) => command.scopes))].sort();
  const products = [...new Set(commands.map((command) => command.product))].sort();

  return {
    kind: 'workspace-plan',
    scopes,
    products,
    commands
  };
}

export function formatPlan(plan) {
  return JSON.stringify(plan, null, 2);
}
