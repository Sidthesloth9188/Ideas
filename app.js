// === App State ===
let ideas = JSON.parse(localStorage.getItem('ideas')) || [];
let currentIdea = null;

// === DOM Elements ===
const categoryList = document.getElementById('categoryList');
const ideaTitleBar = document.getElementById('ideaTitle');
const commandsText = document.getElementById('commandsText');
const notesText = document.getElementById('notesText');
const addIdeaBtn = document.getElementById('addIdeaBtn');
const modal = document.getElementById('modal');
const newIdeaTitle = document.getElementById('newIdeaTitle');
const newIdeaCategory = document.getElementById('newIdeaCategory');
const saveNewIdeaBtn = document.getElementById('saveNewIdeaBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const exportBtn = document.getElementById('exportIdeasBtn');
const toggleThemeBtn = document.getElementById('toggleThemeBtn');

// === Render Functions ===
function renderSidebar() {
  const categories = {};
  ideas.forEach(idea => {
    if (!categories[idea.category]) categories[idea.category] = [];
    categories[idea.category].push(idea);
  });

  categoryList.innerHTML = '';
  Object.keys(categories).forEach(category => {
    const catDiv = document.createElement('div');
    catDiv.className = 'category';
    catDiv.textContent = category;
    categoryList.appendChild(catDiv);

    categories[category].forEach(idea => {
      const ideaBtn = document.createElement('div');
      ideaBtn.className = 'idea-item';
      ideaBtn.textContent = idea.title;

      const menu = document.createElement('span');
      menu.className = 'idea-options';
      menu.innerHTML = '⚙️';
      menu.title = 'Edit or Delete';
      menu.onclick = (e) => {
        e.stopPropagation();
        const action = prompt('Type "edit" to rename, "delete" to remove:');
        if (action === 'edit') editIdea(idea);
        if (action === 'delete') deleteIdea(idea);
      };

      ideaBtn.onclick = () => loadIdea(idea.title);
      ideaBtn.appendChild(menu);
      categoryList.appendChild(ideaBtn);
    });
  });
}

function loadIdea(title) {
  currentIdea = ideas.find(i => i.title === title);
  if (!currentIdea) return;
  ideaTitleBar.textContent = currentIdea.title;
  commandsText.value = currentIdea.commands || '';
  notesText.value = currentIdea.notes || '';
  commandsText.disabled = false;
  notesText.disabled = false;
}

function saveToLocal() {
  localStorage.setItem('ideas', JSON.stringify(ideas));
}

function deleteIdea(idea) {
  if (!confirm(`Delete idea "${idea.title}"?`)) return;
  ideas = ideas.filter(i => i !== idea);
  if (currentIdea?.title === idea.title) {
    currentIdea = null;
    ideaTitleBar.textContent = 'Select an idea';
    commandsText.value = '';
    notesText.value = '';
    commandsText.disabled = true;
    notesText.disabled = true;
  }
  saveToLocal();
  renderSidebar();
}

function editIdea(idea) {
  const newTitle = prompt('New title:', idea.title);
  const newCategory = prompt('New category:', idea.category);
  if (newTitle && newCategory) {
    idea.title = newTitle;
    idea.category = newCategory;
    saveToLocal();
    renderSidebar();
    loadIdea(newTitle);
  }
}

// === Events ===
addIdeaBtn.onclick = () => {
  modal.classList.remove('hidden');
};

cancelModalBtn.onclick = () => {
  modal.classList.add('hidden');
  newIdeaTitle.value = '';
  newIdeaCategory.value = '';
};

saveNewIdeaBtn.onclick = () => {
  const title = newIdeaTitle.value.trim();
  const category = newIdeaCategory.value.trim();
  if (!title || !category) return;

  const newIdea = { title, category, commands: '', notes: '' };
  ideas.push(newIdea);
  saveToLocal();
  renderSidebar();
  modal.classList.add('hidden');
  newIdeaTitle.value = '';
  newIdeaCategory.value = '';
};

commandsText.addEventListener('input', () => {
  if (currentIdea) {
    currentIdea.commands = commandsText.value;
    saveToLocal();
  }
});

notesText.addEventListener('input', () => {
  if (currentIdea) {
    currentIdea.notes = notesText.value;
    saveToLocal();
  }
});

exportBtn.onclick = () => {
  const blob = new Blob([JSON.stringify(ideas, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'ideas.json';
  a.click();
};

toggleThemeBtn.onclick = () => {
  document.body.classList.toggle('light-mode');
};

// === Init ===
renderSidebar();