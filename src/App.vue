<script setup>
import { ref } from 'vue'

const showInput = ref(false)
const newText = ref('')
const news = ref([])
const editId = ref(null)
const editText = ref('')

function toggleInput() {
  showInput.value = !showInput.value
  if (!showInput.value) newText.value = ''
}

function addNews() {
  const text = newText.value.trim()
  if (!text) return
  news.value.unshift({ id: Date.now(), text })
  newText.value = ''
  showInput.value = false
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
  const idx = news.value.findIndex(n => n.id === editId.value)
  if (idx !== -1) news.value[idx].text = text
  editId.value = null
  editText.value = ''
}

function cancelEdit() {
  editId.value = null
  editText.value = ''
}

function deleteNews(id) {
  news.value = news.value.filter(n => n.id !== id)
}
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
              <p>{{ item.text }}</p>
            </div>
          </div>

          <div class="controls">
            <template v-if="editId === item.id">
              <button class="save" @click="saveEdit">Salvar</button>
              <button class="cancel" @click="cancelEdit">Cancelar</button>
            </template>
            <template v-else>
              <button class="icon-btn" title="Editar" @click="startEdit(item)">✏️</button>
              <button class="icon-btn" title="Excluir" @click="deleteNews(item.id)">🗑️</button>
            </template>
          </div>
        </div>
      </div>
    </section>
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
  background: #d32f2f;
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
  background: #b71c1c;
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
