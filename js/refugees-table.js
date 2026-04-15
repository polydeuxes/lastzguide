(async function initRefugeeTable() {
  const tableBody = document.getElementById('refugee-table-body');
  const searchInput = document.getElementById('refugee-search');
  const jobFilter = document.getElementById('job-filter');
  const sortButtons = Array.from(document.querySelectorAll('.sort-btn'));

  if (!tableBody || !searchInput || !jobFilter || sortButtons.length === 0) {
    return;
  }

  const qualityOrder = ['Purple', 'Gold'];
  const qualityRank = { purple: 0, gold: 1 };

  let refugees = [];
  let sortKey = 'name';
  let sortAsc = true;

  function normalizeRefugee(item) {
    const name = String(item.name || item.refugee || item.job || 'Unknown').trim();
    const basePerk = String(item.basePerk || item.buffByQuality || item.buff || 'See in-game details.').trim();
    const upgradeNotes = String(item.upgradeNotes || item.notes || 'Only Purple and Gold are upgradable.').trim();

    const qualityData = item.qualityData && typeof item.qualityData === 'object'
      ? item.qualityData
      : {};

    return { name, basePerk, upgradeNotes, qualityData };
  }

  function explodeQualityRows(refugeeRows) {
    return refugeeRows.flatMap((row) => qualityOrder
      .filter((quality) => row.qualityData[quality])
      .map((quality) => ({
        name: row.name,
        quality,
        qualityRank: qualityRank[quality.toLowerCase()] ?? 999,
        basePerk: String(row.basePerk).trim(),
        qualityPerk: String(row.qualityData[quality].basePerk || '').trim(),
        upgradePerk: String(row.qualityData[quality].upgradePerk || '').trim(),
        upgradeNotes: row.upgradeNotes
      })));
  }

  function renderRows(rows) {
    if (rows.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5">No matching refugees.</td></tr>';
      return;
    }

    const grouped = rows.reduce((acc, row) => {
      const groupKey = row.name;
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
          <td>${row.quality}</td>
          ${index === 0 ? `<td rowspan="${group.length}">${row.basePerk}</td>` : ''}
          <td>${row.qualityPerk}</td>
          <td>${row.upgradePerk}</td>
          ${index === 0 ? `<td rowspan="${group.length}">${row.upgradeNotes}</td>` : ''}
        </tr>
      `).join(''))
      .join('');
  }

  function updateJobFilterOptions(rows) {
    const uniqueNames = Array.from(new Set(rows.map((row) => row.name))).sort((a, b) => a.localeCompare(b));
    jobFilter.innerHTML = '<option value="all">All refugees</option>'
      + uniqueNames.map((name) => `<option value="${name}">${name}</option>`).join('');
  }

  function getFilteredSortedRows() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedName = jobFilter.value;

    const filtered = refugees.filter((row) => {
      const matchesSearch = !searchTerm
        || row.name.toLowerCase().includes(searchTerm)
        || row.quality.toLowerCase().includes(searchTerm)
        || row.basePerk.toLowerCase().includes(searchTerm)
        || row.qualityPerk.toLowerCase().includes(searchTerm)
        || row.upgradePerk.toLowerCase().includes(searchTerm)
        || row.upgradeNotes.toLowerCase().includes(searchTerm);

      const matchesName = selectedName === 'all' || row.name === selectedName;

      return matchesSearch && matchesName;
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
    tableBody.innerHTML = '<tr><td colspan="6">Failed to load refugee data.</td></tr>';
  }
})();
