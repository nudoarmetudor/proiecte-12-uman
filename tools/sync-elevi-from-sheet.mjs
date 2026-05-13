import fs from 'node:fs/promises';

const DEFAULT_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIwyVCMRw80uosx5ua6JV8ZP3gwwmynh8dYIcAgC6cQOSRHrYKdqUS-CNR8EFfW3g9cD7UdEgYN1ga/pub?gid=897180671&single=true&output=csv';

const SHEET_CSV_URL = process.env.SHEET_CSV_URL || DEFAULT_SHEET_CSV_URL;

console.log('Using CSV URL:');
console.log(SHEET_CSV_URL);

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === ',' && !insideQuotes) {
      result.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  result.push(current);

  return result.map(value => value.trim());
}

function parseCsv(text) {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter(line => line.trim() !== '');

  if (!lines.length) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map(header => header.trim());

  return lines.slice(1).map(line => {
    const values = parseCsvLine(line);
    const item = {};

    headers.forEach((header, index) => {
      item[header] = values[index] || '';
    });

    return item;
  });
}

function normalizeBoolean(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function isActive(value) {
  const normalized = normalizeBoolean(value);

  if (!normalized) {
    return true;
  }

  return ['true', '1', 'yes', 'da', 'activ', 'active'].includes(normalized);
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'proiect';
}

function normalizeProject(row, index) {
  const nume = String(row.nume || '').trim();
  const id = String(row.id || slugify(nume) || `proiect-${index + 1}`).trim();
  const url = String(row.url || '').trim();
  const categorie = String(row.categorie || row.categoria || 'Necategorizat').trim();

  return {
    id,
    nume,
    url,
    categorie
  };
}

async function main() {
  const response = await fetch(SHEET_CSV_URL);

  if (!response.ok) {
    throw new Error(`Could not fetch Google Sheet CSV. HTTP ${response.status}`);
  }

  const csvText = await response.text();
  const rows = parseCsv(csvText);

  const projects = rows
    .filter(row => isActive(row.activ))
    .map(normalizeProject)
    .filter(project => project.id && project.nume)
    .sort((a, b) => a.nume.localeCompare(b.nume, 'ro', { sensitivity: 'base' }));

  const seenIds = new Set();
  const duplicates = [];

  projects.forEach(project => {
    if (seenIds.has(project.id)) {
      duplicates.push(project.id);
    }

    seenIds.add(project.id);
  });

  if (duplicates.length) {
    console.error(`Duplicate project IDs found: ${duplicates.join(', ')}`);
    process.exit(1);
  }

  const output = JSON.stringify(projects, null, 2) + '\n';

  await fs.writeFile('elevi.json', output, 'utf8');

  console.log(`Generated elevi.json with ${projects.length} active projects.`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
