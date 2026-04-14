(async function initRefugeeRecruitment() {
  const pickButtons = [
    document.getElementById('pick-1-btn'),
    document.getElementById('pick-2-btn'),
    document.getElementById('pick-3-btn')
  ];
  const resetButton = document.getElementById('reset-btn');
  const resultsContainer = document.getElementById('recruit-results');
  const messageEl = document.getElementById('recruit-message');

  const rarityWeights = [
    { rarity: 'Orange', className: 'rarity-orange', weight: 6.7357 },
    { rarity: 'Purple', className: 'rarity-purple', weight: 20.2073 },
    { rarity: 'Blue', className: 'rarity-blue', weight: 33.6788 },
    { rarity: 'Green', className: 'rarity-green', weight: 39.3782 }
  ];

  let refugeePool = [];
  let currentPick = 0;

  try {
    const response = await fetch('data/refugee-stats.json');
    const data = await response.json();
    refugeePool = Array.isArray(data.refugees) ? data.refugees.map((item) => item.name) : [];

    if (refugeePool.length === 0) {
      messageEl.textContent = 'No refugees found in data blob.';
      pickButtons.forEach((btn) => {
        btn.disabled = true;
      });
    }
  } catch (error) {
    messageEl.textContent = 'Failed to load refugee data blob.';
    pickButtons.forEach((btn) => {
      btn.disabled = true;
    });
  }

  function drawRarity() {
    const roll = Math.random() * 100;
    let cumulative = 0;

    for (const option of rarityWeights) {
      cumulative += option.weight;
      if (roll <= cumulative) {
        return option;
      }
    }

    return rarityWeights[rarityWeights.length - 1];
  }

  function drawRefugeeName() {
    if (refugeePool.length === 0) {
      return 'Unknown';
    }

    const index = Math.floor(Math.random() * refugeePool.length);
    return refugeePool.splice(index, 1)[0];
  }

  function renderRecruitCard(pickNumber, recruitName, rarity) {
    const card = document.createElement('div');
    card.className = 'content-block recruit-card';

    card.innerHTML = `
      <h3>Pick #${pickNumber}</h3>
      <p><strong>Refugee:</strong> ${recruitName}</p>
      <p><strong>Rarity:</strong> <span class="rarity-badge ${rarity.className}">${rarity.rarity}</span></p>
    `;

    resultsContainer.appendChild(card);
  }

  function setButtonState() {
    pickButtons.forEach((btn, index) => {
      btn.disabled = index !== currentPick || currentPick > 2 || refugeePool.length === 0;
    });

    if (currentPick > 2) {
      messageEl.textContent = 'All 3 recruits completed. Press Reset to recruit again.';
    } else if (refugeePool.length === 0) {
      messageEl.textContent = 'No more refugees available in the pool.';
    } else {
      messageEl.textContent = '';
    }
  }

  pickButtons.forEach((button, index) => {
    button.addEventListener('click', function onPick() {
      if (index !== currentPick || refugeePool.length === 0) {
        return;
      }

      const rarity = drawRarity();
      const recruitName = drawRefugeeName();

      renderRecruitCard(currentPick + 1, recruitName, rarity);
      currentPick += 1;
      setButtonState();
    });
  });

  resetButton.addEventListener('click', async function onReset() {
    currentPick = 0;
    resultsContainer.innerHTML = '';

    try {
      const response = await fetch('data/refugee-stats.json');
      const data = await response.json();
      refugeePool = Array.isArray(data.refugees) ? data.refugees.map((item) => item.name) : [];
    } catch (error) {
      refugeePool = [];
      messageEl.textContent = 'Failed to reload refugee data blob.';
    }

    setButtonState();
  });

  setButtonState();
})();
