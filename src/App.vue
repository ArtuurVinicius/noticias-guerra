<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { subscribeNews, createNews, editNews, deleteNews } from './firebase'

const showInput = ref(false)
const newText = ref('')
const news = ref([])
const editId = ref(null)
const editText = ref('')
const confirmDeleteId = ref(null)
const confirmDeleteText = ref('')
const showProfanityModal = ref(false)
const expanded = reactive({})

const profanityList = [
  'porra', 'caralho', 'cu', 'buceta', 'pika', 'puta que pariu', 'pqp', 'rola', 'foda'
]
const profanityRegex = new RegExp(
  profanityList
    .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .map(w => `\\b${w}\\b`)
    .join('|'),
  'i'
)

let unsubscribe = null

onMounted(() => {
  unsubscribe = subscribeNews((items) => {
    news.value = items
  })
})

onUnmounted(() => {
  if (typeof unsubscribe === 'function') unsubscribe()
})

function toggleInput() {
  showInput.value = !showInput.value
  if (!showInput.value) newText.value = ''
}

function addNews() {
  const text = newText.value.trim()
  if (!text) return
  if (profanityRegex.test(text)) {
    showProfanityModal.value = true
    return
  }
  createNews(text).then(() => {
    newText.value = ''
    showInput.value = false
  })
}

function cancel() {
  newText.value = ''
  showInput.value = false
}

function startEdit(item) {
  editId.value = item.id
  editText.value = item.text
}

function saveEdit() {
  const text = editText.value.trim()
  if (!text) return
  editNews(editId.value, text).then(() => {
    editId.value = null
    editText.value = ''
  })
}

function toggleExpand(id) {
  expanded[id] = !expanded[id]
}

function isLong(text) {
  if (!text) return false
  return text.length > 300
}

function cancelEdit() {
  editId.value = null
  editText.value = ''
}

function openDeleteModal(item) {
  confirmDeleteId.value = item.id
  confirmDeleteText.value = item.text
}

function closeDeleteModal() {
  confirmDeleteId.value = null
  confirmDeleteText.value = ''
}

function confirmDelete() {
  if (!confirmDeleteId.value) return
  deleteNews(confirmDeleteId.value).then(() => {
    closeDeleteModal()
  })
}

function closeProfanityModal() {
  showProfanityModal.value = false
}

// Direct deletion handled by calling `deleteNews(id)` from the template
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>Notícias Guerra EUA x Irã</h1>
      <button class="add-btn" @click="toggleInput">+</button>
    </header>

    <div v-if="showInput" class="input-area">
      <textarea v-model="newText" placeholder="Digite a notícia..." rows="4"></textarea>
      <div class="actions">
        <button class="save" @click="addNews">Salvar</button>
        <button class="cancel" @click="cancel">Cancelar</button>
      </div>
    </div>

    <section class="cards">
      <div v-if="news.length === 0" class="empty">Nenhuma notícia ainda.</div>
      <div v-for="item in news" :key="item.id" class="card">
        <div class="card-body">
          <div class="content">
            <div v-if="editId === item.id">
              <textarea v-model="editText" rows="4"></textarea>
            </div>
            <div v-else>
              <p :class="{ clamped: !expanded[item.id] && isLong(item.text) }">{{ item.text }}</p>
              <div v-if="isLong(item.text)" class="more">
                <button class="show-more" @click="toggleExpand(item.id)">{{ expanded[item.id] ? 'Mostrar menos' : 'Mostrar mais' }}</button>
              </div>
            </div>
          </div>

          <div class="controls">
            <template v-if="editId === item.id">
              <button class="save" @click="saveEdit">Salvar</button>
              <button class="cancel" @click="cancelEdit">Cancelar</button>
            </template>
            <template v-else>
              <button class="icon-btn" title="Editar" @click="startEdit(item)" aria-label="Editar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="#495057"/>
                  <path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.41l-2.34-2.34a1.003 1.003 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#495057"/>
                </svg>
                <span class="control-label">Editar</span>
              </button>
              <button class="icon-btn delete" title="Excluir" @click="openDeleteModal(item)" aria-label="Excluir">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M6 7h12v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7z" fill="#d32f2f"/>
                  <path d="M9 4h6v2H9z" fill="#d32f2f"/>
                  <path d="M10 11v6" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M14 11v6" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="control-label">Excluir</span>
              </button>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- Delete confirmation modal -->
    <div v-if="confirmDeleteId" class="modal-overlay">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h3 id="modal-title">Confirma exclusão?</h3>
        <p class="modal-text">Tem certeza que deseja excluir esta notícia?</p>
        <blockquote class="modal-quote">{{ confirmDeleteText }}</blockquote>
        <div class="modal-actions">
          <button class="cancel" @click="closeDeleteModal">Cancelar</button>
          <button class="save" @click="confirmDelete">Excluir</button>
        </div>
      </div>
    </div>

    <!-- Profanity warning modal -->
    <div v-if="showProfanityModal" class="modal-overlay">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="profanity-title">
        <h3 id="profanity-title">Pode não man</h3>
        <p class="modal-text">O texto contém palavras não permitidas e não foi salvo.</p>
        <div class="modal-actions">
          <button class="save" @click="closeProfanityModal">OK</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap');

.app {
  max-width: 960px;
  margin: 40px auto;
  padding: 32px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #1a1a1a;
  padding-bottom: 20px;
  margin-bottom: 32px;
}

.header h1 {
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  letter-spacing: -0.5px;
  text-transform: uppercase;
}

.add-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
    background: #2e7d32;
  color: white;
  font-size: 28px;
  font-weight: 300;
  line-height: 1;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn:hover {
  background: #1b5e20;
  transform: scale(1.05);
}

.input-area {
  margin-bottom: 32px;
  background: #f8f9fa;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.input-area textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 16px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  resize: vertical;
  background: white;
  transition: border-color 0.2s;
}

.input-area textarea:focus {
  outline: none;
  border-color: #adb5bd;
}

.actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.save {
  background: #1a1a1a;
  color: white;
  border: none;
  padding: 12px 24px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.save:hover {
  background: #333;
}

.cancel {
  background: transparent;
  color: #495057;
  border: 1px solid #ced4da;
  padding: 12px 24px;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel:hover {
  background: #e9ecef;
  color: #212529;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.card {
  background: #fff;
  border: 1px solid #e9ecef;
  padding: 24px;
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.card-body {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  height: 100%;
}

.content {
  flex: 1;
}

.card p {
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
  color: #343a40;
  white-space: pre-wrap;
  /* allow breaking long words to avoid overflow */
  overflow-wrap: anywhere;
  word-break: break-word;
}

.clamped {
  /* limit to ~6 lines while preserving line breaks */
  max-height: calc(1.6em * 6);
  overflow: hidden;
  /* ensure long words are wrapped inside the clamped area */
  overflow-wrap: anywhere;
  word-break: break-word;
}
.more {
  margin-top: 8px;
}
.show-more {
  background: transparent;
  border: none;
  color: #0d6efd;
  cursor: pointer;
  font-weight: 600;
  padding: 4px 6px;
}
.show-more:hover {
  text-decoration: underline;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.icon-btn {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  color: #495057;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.icon-btn svg {
  display: block;
}
.icon-btn .control-label {
  display: none;
  font-size: 12px;
  color: #495057;
  margin-top: 6px;
}
.icon-btn.delete {
  background: #fff5f5;
  border-color: #ffe6e6;
}
.icon-btn.delete:hover {
  background: #ffeaea;
}

.icon-btn:hover {
  background: #e9ecef;
  color: #212529;
}

.icon-btn[title="Excluir"]:hover {
  color: #d32f2f;
  border-color: #fbcfe8;
  background: #fdf2f8;
}

.empty {
  grid-column: 1 / -1;
  text-align: center;
  color: #adb5bd;
  font-size: 18px;
  padding: 40px;
  font-style: italic;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.35);
  z-index: 1200;
}
.modal {
  width: 92%;
  max-width: 420px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.18);
}
.modal h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
}
.modal-text {
  margin: 0 0 12px 0;
  color: #495057;
}
.modal-quote {
  margin: 0 0 16px 0;
  padding: 10px 12px;
  background: #f8f9fa;
  border-left: 3px solid #e9ecef;
  color: #343a40;
  border-radius: 6px;
  font-size: 14px;
}
.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
.modal .cancel {
  background: transparent;
  border: 1px solid #ced4da;
  color: #495057;
}
.modal .save {
  background: #d32f2f;
  color: white;
}

/* Profanity modal uses same modal styles; make OK button neutral */
.modal .save:focus {
  outline: none;
}

/* Responsive improvements */
@media (max-width: 900px) {
  .app {
    margin: 24px 12px;
    padding: 20px;
  }
  .header h1 {
    font-size: 26px;
  }
  .cards {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 18px;
  }
}

@media (max-width: 600px) {
  .app {
    margin: 12px;
    padding: 16px;
    border-radius: 10px;
    align-self: center;
  }
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .header h1 {
    font-size: 26px;
    line-height: 1.05;
  }
  .add-btn {
    width: 44px;
    height: 44px;
    font-size: 24px;
  }
  .input-area {
    padding: 16px;
  }
  .input-area textarea {
    padding: 12px;
    font-size: 15px;
  }
  .cards {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .card {
    padding: 18px;
  }
  .card-body {
    flex-direction: column;
  }
  .controls {
    flex-direction: row;
    gap: 8px;
    margin-top: 12px;
    align-self: flex-end;
  }
  .icon-btn {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    font-size: 18px;
    padding: 6px;
    flex-direction: column;
  }
  .icon-btn .control-label {
    display: block;
    font-size: 12px;
    margin-top: 6px;
  }
}

@media (max-width: 420px) {
  .header h1 {
    font-size: 20px;
    line-height: 1.08;
  }
  .save, .cancel {
    padding: 10px 14px;
    font-size: 14px;
  }
  .empty {
    padding: 28px;
    font-size: 16px;
  }
}
</style>

<style>
body {
  margin: 0;
  background-color: #f1f3f5;
  color: #212529;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
