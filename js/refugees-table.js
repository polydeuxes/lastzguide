(async function initRefugeeTable() {
  const tableBody = document.getElementById('refugee-table-body');
  const searchInput = document.getElementById('refugee-search');
  const jobFilter = document.getElementById('job-filter');
  const sortButtons = Array.from(document.querySelectorAll('.sort-btn'));

  if (!tableBody || !searchInput || !jobFilter || sortButtons.length === 0) {
    return;
  }

  const qualityOrder = ['Green', 'Blue', 'Purple', 'Gold'];
  const qualityRank = qualityOrder.reduce((acc, quality, index) => {
    acc[quality.toLowerCase()] = index;
    return acc;
  }, {});

  let refugees = [];
  let sortKey = 'name';
  let sortAsc = true;

  function defaultQualityBuffs(buffText) {
    return {
      Green: `${buffText} (entry tier impact).`,
      Blue: `${buffText} (improved over Green).`,
      Purple: `${buffText} (high impact tier; upgradable).`,
      Gold: `${buffText} (best impact tier; upgradable).`
    };
  }

  function normalizeRefugee(item) {
    const name = String(item.name || item.refugee || item.job || 'Unknown').trim();
    const job = String(item.job || item.role || item.name || 'Unknown').trim();
    const buffByQuality = String(item.buffByQuality || item.buff || item.statistics?.buffByQuality || 'See in-game details by quality.').trim();
    const upgradeNotes = String(item.upgradeNotes || item.notes || item.statistics?.notes || 'Only Purple and Gold are upgradable.').trim();
    const qualityBuffs = item.qualityBuffs && typeof item.qualityBuffs === 'object'
      ? item.qualityBuffs
      : defaultQualityBuffs(buffByQuality);

    return { name, job, upgradeNotes, qualityBuffs };
  }

  function explodeQualityRows(refugeeRows) {
    return refugeeRows.flatMap((row) => qualityOrder
      .filter((quality) => row.qualityBuffs[quality])
      .map((quality) => ({
        name: row.name,
        job: row.job,
        quality,
        qualityRank: qualityRank[quality.toLowerCase()] ?? 999,
        buffByQuality: String(row.qualityBuffs[quality]).trim(),
        upgradeNotes: row.upgradeNotes
      })));
  }

  function renderRows(rows) {
    if (rows.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5">No matching refugees.</td></tr>';
      return;
    }

    const grouped = rows.reduce((acc, row) => {
      const groupKey = `${row.name}::${row.job}`;
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(row);
      return acc;
    }, {});

    tableBody.innerHTML = Object.values(grouped)
      .map((group) => group.map((row, index) => `
        <tr>
          ${index === 0 ? `<td rowspan="${group.length}">${row.name}</td>` : ''}
          ${index === 0 ? `<td rowspan="${group.length}">${row.job}</td>` : ''}
          <td>${row.quality}</td>
          <td>${row.buffByQuality}</td>
          ${index === 0 ? `<td rowspan="${group.length}">${row.upgradeNotes}</td>` : ''}
        </tr>
      `).join(''))
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
      if (sortKey === 'quality') {
        const compare = a.qualityRank - b.qualityRank;
        return sortAsc ? compare : -compare;
      }

      const left = String(a[sortKey] || '').toLowerCase();
      const right = String(b[sortKey] || '').toLowerCase();
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
    const normalized = Array.isArray(data.refugees) ? data.refugees.map(normalizeRefugee) : [];
    refugees = explodeQualityRows(normalized);

    updateJobFilterOptions(refugees);
    render();
  } catch (error) {
    tableBody.innerHTML = '<tr><td colspan="5">Failed to load refugee data.</td></tr>';
  }
})();
