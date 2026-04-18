import { createRoot } from 'react-dom/client'
import './index.css'
import Root from './App.jsx'
import { initializeTheme } from './utils/themeUtils'

initializeTheme()

createRoot(document.getElementById('root')).render(
    <Root />
)
