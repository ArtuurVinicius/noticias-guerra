// Firebase initialization and Firestore helpers
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCEyFKwWuKdFaTD5hL3KmsmmDAZ2urEcbs",
  authDomain: "noticias-guerra.firebaseapp.com",
  projectId: "noticias-guerra",
  storageBucket: "noticias-guerra.firebasestorage.app",
  messagingSenderId: "1049658342273",
  appId: "1:1049658342273:web:cde5a796390bcdef27c680",
  measurementId: "G-X8GRV38NJY",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const newsCol = collection(db, 'news')

export function subscribeNews(cb) {
  const q = query(newsCol, orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    cb(items)
  })
}

export function createNews(text) {
  return addDoc(newsCol, { text, createdAt: serverTimestamp() })
}

export function editNews(id, text) {
  return updateDoc(doc(db, 'news', id), { text })
}

export function deleteNews(id) {
  return deleteDoc(doc(db, 'news', id))
}

export { db }
