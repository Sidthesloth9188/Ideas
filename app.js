// === App State ===
let ideas = JSON.parse(localStorage.getItem('ideas')) || [];
let currentIdea = null;

// === DOM Elements ===
const categoryList = document.getElementById('categoryList');
const ideaTitleBar = document.getElementById('ideaTitle');
const chatBox = document.getElementById('chatBox');
const chatInput = document.getElementById('chatInput');
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

      const exportDot = document.createElement('span');
      exportDot.className = 'idea-dot green';
      exportDot.title = 'Export idea';
      exportDot.onclick = (e) => {
        e.stopPropagation();
        exportIdea(idea);
      };

      const deleteDot = document.createElement('span');
      deleteDot.className = 'idea-dot brown';
      deleteDot.title = 'Delete idea';
      deleteDot.onclick = (e) => {
        e.stopPropagation();
        deleteIdea(idea);
      };

      ideaBtn.appendChild(exportDot);
      ideaBtn.appendChild(deleteDot);
      ideaBtn.onclick = () => loadIdea(idea.title);
      categoryList.appendChild(ideaBtn);
    });
  });
}

function loadIdea(title) {
  currentIdea = ideas.find(i => i.title === title);
  if (!currentIdea) return;
  ideaTitleBar.textContent = currentIdea.title;
  renderChat();
  chatInput.disabled = false;
}

function renderChat() {
  chatBox.innerHTML = '';
  (currentIdea.messages || []).forEach((msg, index) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message';
    msgDiv.textContent = msg;

    const controls = document.createElement('div');
    controls.className = 'msg-controls';

    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy';
    copyBtn.onclick = () => navigator.clipboard.writeText(msg);

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => {
      const newText = prompt('Edit message:', msg);
      if (newText !== null) {
        currentIdea.messages[index] = newText;
        saveToLocal();
        renderChat();
      }
    };

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.onclick = () => {
      currentIdea.messages.splice(index, 1);
      saveToLocal();
      renderChat();
    };

    controls.appendChild(copyBtn);
    controls.appendChild(editBtn);
    controls.appendChild(delBtn);
    msgDiv.appendChild(controls);
    chatBox.appendChild(msgDiv);
  });
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
    chatBox.innerHTML = '';
    chatInput.disabled = true;
  }
  saveToLocal();
  renderSidebar();
}

function exportIdea(idea) {
  const blob = new Blob([JSON.stringify(idea, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${idea.title}.json`;
  a.click();
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

  const newIdea = { title, category, messages: [] };
  ideas.push(newIdea);
  saveToLocal();
  renderSidebar();
  modal.classList.add('hidden');
  newIdeaTitle.value = '';
  newIdeaCategory.value = '';
};

chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && currentIdea && chatInput.value.trim()) {
    currentIdea.messages = currentIdea.messages || [];
    currentIdea.messages.push(chatInput.value.trim());
    chatInput.value = '';
    saveToLocal();
    renderChat();
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