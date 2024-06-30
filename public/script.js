// Fetch problems from the server
async function fetchProblems(topic, minRating, maxRating, numProblems) {
    const response = await fetch('/fetch-problems', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ topic, minRating, maxRating, numProblems })
    });
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      alert(data.error);
      return [];
    }
  }
  
  // Update the problems table
  function updateTable(problems) {
    const tbody = document.getElementById('problemsTableBody');
    tbody.innerHTML = '';
    problems.forEach((problem, index) => {
      const tr = document.createElement('tr');
      tr.className = problem.solved ? 'solved' : '';
      tr.innerHTML = `
        <td>${problem.name}</td>
        <td>${problem.contestId}-${problem.index}</td>
        <td><a href="https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}" target="_blank">Link</a></td>
        <td>${problem.rating}</td>
        <td><input type="checkbox" ${problem.solved ? 'checked' : ''} data-index="${index}"></td>
      `;
      tbody.appendChild(tr);
    });
  }
  
  // Save mashup to local storage
  function saveMashup(name, problems) {
    const mashups = JSON.parse(localStorage.getItem('mashups')) || {};
    mashups[name] = problems;
    localStorage.setItem('mashups', JSON.stringify(mashups));
    loadSavedMashups();
  }
  
  // Load saved mashups into the select element
  function loadSavedMashups() {
    const select = document.getElementById('savedMashups');
    const mashups = JSON.parse(localStorage.getItem('mashups')) || {};
    select.innerHTML = '';
    Object.keys(mashups).forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });
  }
  
  // Load a mashup from local storage
  function loadMashup(name) {
    const mashups = JSON.parse(localStorage.getItem('mashups')) || {};
    if (mashups[name]) {
      updateTable(mashups[name]);
    }
  }
  
  // Event listeners
  document.getElementById('generate').addEventListener('click', async () => {
    const topic = document.getElementById('topic').value;
    const numProblems = parseInt(document.getElementById('number').value);
    const minRating = parseInt(document.getElementById('minRating').value);
    const maxRating = parseInt(document.getElementById('maxRating').value);
    const mashup = await fetchProblems(topic, minRating, maxRating, numProblems);
    updateTable(mashup);
  });
  
  document.getElementById('save').addEventListener('click', () => {
    const name = prompt('Enter a name for this mashup:');
    const problems = Array.from(document.querySelectorAll('#problemsTableBody tr')).map((tr, index) => ({
      name: tr.cells[0].textContent,
      contestId: tr.cells[1].textContent.split('-')[0],
      index: tr.cells[1].textContent.split('-')[1],
      rating: parseInt(tr.cells[3].textContent),
      solved: tr.cells[4].firstChild.checked
    }));
    saveMashup(name, problems);
  });
  
  document.getElementById('load').addEventListener('click', () => {
    const name = document.getElementById('savedMashups').value;
    loadMashup(name);
  });
  
  document.getElementById('problemsTableBody').addEventListener('change', (event) => {
    if (event.target.type === 'checkbox') {
      const index = event.target.dataset.index;
      const tr = event.target.closest('tr');
      tr.className = event.target.checked ? 'solved' : '';
    }
  });
  
  // Load saved mashups on page load
  document.addEventListener('DOMContentLoaded', loadSavedMashups);
  