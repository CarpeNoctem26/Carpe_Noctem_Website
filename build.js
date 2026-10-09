import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function buildIssuesIndex(contentDir = path.join(__dirname, 'content')) {
  const issuesDir = path.join(contentDir, 'issues');
  const outputFile = path.join(contentDir, 'issues-index.json');

  // Ensure content directory exists
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }

  // Defensive check for issues directory
  if (!fs.existsSync(issuesDir)) {
    fs.writeFileSync(outputFile, JSON.stringify([], null, 2), 'utf8');
    console.log(`[build.js] 'content/issues' directory not found. Generated empty issues-index.json.`);
    return [];
  }

  const files = fs.readdirSync(issuesDir).filter(file => file.endsWith('.json'));

  if (files.length === 0) {
    fs.writeFileSync(outputFile, JSON.stringify([], null, 2), 'utf8');
    console.log(`[build.js] No .json files found in 'content/issues'. Generated empty issues-index.json.`);
    return [];
  }

  const issues = [];
  for (const file of files) {
    const filePath = path.join(issuesDir, file);
    try {
      const rawContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(rawContent);
      issues.push(data);
    } catch (err) {
      console.error(`[build.js] Error parsing JSON file: ${file}`, err);
    }
  }

  // Sort strictly by date descending (most recent first)
  issues.sort((a, b) => {
    const dateA = a && a.date ? new Date(a.date).getTime() : 0;
    const dateB = b && b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });

  fs.writeFileSync(outputFile, JSON.stringify(issues, null, 2), 'utf8');
  console.log(`[build.js] Successfully processed ${issues.length} issue(s) into content/issues-index.json`);
  return issues;
}

// Execute if run directly from CLI
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  buildIssuesIndex();
}
