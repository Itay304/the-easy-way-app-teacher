import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// נלכד כאן, לפני שה-app בכלל נטען — לא ב-Login.jsx, כי מורה שמגיע
// מקישור הזמנה (?institutionCode=) עשוי להיתקל ב-InstallRequired (PWA
// install gate) לפני שהוא בכלל מגיע למסך login, ואז ה-query string
// הולך לאיבוד לגמרי ברגע שהוא פותח את ה-app המותקן מהמסך הבית.
// localStorage שורד את זה; state של קומפוננטה לא היה שורד.
const institutionCode = new URLSearchParams(window.location.search).get('institutionCode')
if (institutionCode) {
  localStorage.setItem('pending_institution_code', institutionCode.trim())
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
  })
}
