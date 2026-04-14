(async function initRefugeeTable() {
  const tableBody = document.getElementById('refugee-table-body');
  const searchInput = document.getElementById('refugee-search');
  const jobFilter = document.getElementById('job-filter');
  const sortButtons = Array.from(document.querySelectorAll('.sort-btn'));

  if (!tableBody || !searchInput || !jobFilter || sortButtons.length === 0) {
    return;
  }

  let refugees = [];
  let sortKey = 'name';
  let sortAsc = true;

  function normalizeRefugee(item) {
    const name = String(item.name || item.refugee || item.job || 'Unknown').trim();
    const job = String(item.job || item.role || item.name || 'Unknown').trim();
    const quality = String(item.quality || item.qualities || 'Green, Blue, Purple, Gold').trim();
    const buffByQuality = String(item.buffByQuality || item.buff || item.statistics?.buffByQuality || 'See in-game details by quality.').trim();
    const upgradeNotes = String(item.upgradeNotes || item.notes || item.statistics?.notes || 'Only Purple and Gold are upgradable.').trim();

    return { name, job, quality, buffByQuality, upgradeNotes };
  }

  function renderRows(rows) {
    if (rows.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5">No matching refugees.</td></tr>';
      return;
    }

    tableBody.innerHTML = rows
      .map((row) => `
        <tr>
          <td>${row.name}</td>
          <td>${row.job}</td>
          <td>${row.quality}</td>
          <td>${row.buffByQuality}</td>
          <td>${row.upgradeNotes}</td>
        </tr>
      `)
      .join('');
  }

  function updateJobFilterOptions(rows) {
    const uniqueJobs = Array.from(new Set(rows.map((row) => row.job))).sort((a, b) => a.localeCompare(b));
    jobFilter.innerHTML = '<option value="all">All jobs</option>'
      + uniqueJobs.map((job) => `<option value="${job}">${job}</option>`).join('');
  }

  function getFilteredSortedRows() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedJob = jobFilter.value;

    const filtered = refugees.filter((row) => {
      const matchesSearch = !searchTerm
        || row.name.toLowerCase().includes(searchTerm)
        || row.job.toLowerCase().includes(searchTerm)
        || row.quality.toLowerCase().includes(searchTerm)
        || row.buffByQuality.toLowerCase().includes(searchTerm)
        || row.upgradeNotes.toLowerCase().includes(searchTerm);

      const matchesJob = selectedJob === 'all' || row.job === selectedJob;

      return matchesSearch && matchesJob;
    });

    filtered.sort((a, b) => {
      const left = a[sortKey].toLowerCase();
      const right = b[sortKey].toLowerCase();
      const compare = left.localeCompare(right);
      return sortAsc ? compare : -compare;
    });

    return filtered;
  }

  function render() {
    renderRows(getFilteredSortedRows());
  }

  sortButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextSortKey = button.dataset.sortKey;
      if (!nextSortKey) {
        return;
      }

      if (sortKey === nextSortKey) {
        sortAsc = !sortAsc;
      } else {
        sortKey = nextSortKey;
        sortAsc = true;
      }

      render();
    });
  });

  searchInput.addEventListener('input', render);
  jobFilter.addEventListener('change', render);

  try {
    const response = await fetch('data/refugee-stats.json');
    const data = await response.json();
    refugees = Array.isArray(data.refugees) ? data.refugees.map(normalizeRefugee) : [];

    updateJobFilterOptions(refugees);
    render();
  } catch (error) {
    tableBody.innerHTML = '<tr><td colspan="5">Failed to load refugee data.</td></tr>';
  }
})();
