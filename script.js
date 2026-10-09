document.addEventListener('DOMContentLoaded', () => {
  fetchAndRenderIssues();
});

async function fetchAndRenderIssues() {
  const gridContainer = document.getElementById('issues-grid');
  if (!gridContainer) return;

  try {
    const response = await fetch('content/issues-index.json');
    if (!response.ok) {
      throw new Error(`Failed to load issues index: ${response.statusText}`);
    }
    
    const issues = await response.json();
    
    if (!Array.isArray(issues) || issues.length === 0) {
      renderEmptyState(gridContainer);
      return;
    }

    // Ensure sorting descending by date (most recent first)
    issues.sort((a, b) => {
      const dateA = a && a.date ? new Date(a.date).getTime() : 0;
      const dateB = b && b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });

    renderIssuesGrid(gridContainer, issues);
  } catch (error) {
    console.warn('Could not fetch issues-index.json:', error);
    renderEmptyState(gridContainer);
  }
}

function renderIssuesGrid(container, issues) {
  container.innerHTML = '';

  issues.forEach(issue => {
    const card = document.createElement('a');
    card.className = 'issue-card';
    card.href = issue.pdf || '#';
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    // 1. Issue Title
    const titleEl = document.createElement('h3');
    titleEl.className = 'issue-title';
    titleEl.textContent = issue.title || 'Untitled Issue';

    // 2. Publish Date
    const dateEl = document.createElement('div');
    dateEl.className = 'issue-date';
    dateEl.textContent = formatDate(issue.date);

    // 3. Cover Image
    const coverContainer = document.createElement('div');
    coverContainer.className = 'issue-cover-container';
    
    const coverImg = document.createElement('img');
    coverImg.className = 'issue-cover';
    coverImg.src = issue.cover || '';
    coverImg.alt = issue.title ? `${issue.title} Cover` : 'Issue Cover';
    coverImg.loading = 'lazy';

    coverContainer.appendChild(coverImg);

    // Append in EXACT vertical order: Title -> Date -> Cover Image
    card.appendChild(titleEl);
    card.appendChild(dateEl);
    card.appendChild(coverContainer);

    container.appendChild(card);
  });
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown Date';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function renderEmptyState(container) {
  container.innerHTML = `
    <div class="empty-state">
      <p>No magazine issues published yet. Check back soon!</p>
    </div>
  `;
}
