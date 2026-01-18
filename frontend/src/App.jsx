import { useState } from 'react'
import './App.css'

function App() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [prompt, setPrompt] = useState("")
  const [strength, setStrength] = useState(0.6)
  const [loading, setLoading] = useState(false)
  const [resultUrl, setResultUrl] = useState(null)

  // Pre-made prompt suggestions for easy testing
  const suggestions = [
    "Cyberpunk gaming setup with neon lights",
    "Minimalist Japanese interior, sunlight",
    "Cozy rustic cabin, warm lighting, fireplace",
    "Luxury modern penthouse, city view",
    "Futuristic space station room, blue holograms"
  ]

  // Handle file selection and preview
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
      setResultUrl(null) // Reset previous result on new upload
    }
  }

  // Handle the generation request to Python Backend
  const handleGenerate = async () => {
    if (!file || !prompt) return alert("Please upload an image and enter a prompt")

    setLoading(true)

    const formData = new FormData()
    formData.append('image', file)
    formData.append('prompt', prompt)
    formData.append('strength', strength)

    try {
      const response = await fetch('https://revision-ai.onrender.com/generate', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (data.result_url) {
        setResultUrl(data.result_url)
      } else {
        alert("Error generating image: " + data.error)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to connect to server. Make sure the backend is running on port 5000.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="main-wrapper">
      <div className="header">
        <h1>ReVision AI</h1>
        <p>Redefine Your Reality</p>
      </div>

      <div className="glass-card">
        {/* Upload Area */}
        <div className="upload-area" onClick={() => document.getElementById('fileInput').click()}>
          {preview ? (
            <img src={preview} alt="Preview" />
          ) : (
            <div>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{color: "#94a3b8", marginBottom: "15px"}}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <h3 style={{margin: 0, color: "#fff"}}>Upload Room Photo</h3>
              <p style={{color: "#94a3b8", margin: "5px 0 0"}}>Tap to browse or drag & drop</p>
            </div>
          )}
          <input 
            type="file" 
            id="fileInput" 
            hidden 
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </div>

        {/* Prompt Suggestions Chips */}
        <div className="chips-container">
          {suggestions.map((suggestion, index) => (
            <div 
              key={index} 
              className="chip" 
              onClick={() => setPrompt(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>

        {/* Prompt Input */}
        <textarea 
          rows="2" 
          placeholder="Describe your dream style..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        ></textarea>

        {/* Controls Grid */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
          <label style={{color: '#fff', fontWeight: 600}}>Transformation Strength</label>
          <span style={{background: '#6366f1', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem'}}>{strength}</span>
        </div>
        
        <input 
          type="range" 
          min="0.1" 
          max="1.0" 
          step="0.1" 
          value={strength}
          onChange={(e) => setStrength(e.target.value)}
        />

        <button 
          className="generate-btn" 
          onClick={handleGenerate} 
          disabled={loading || !file}
        >
          {loading ? "Generating..." : "Re-Imagine Space"}
        </button>
      </div>

      {/* Loading Animation */}
      {loading && (
        <div className="loading-spinner">
          <div className="spinner-dot"></div>
          <div className="spinner-dot"></div>
          <div className="spinner-dot"></div>
        </div>
      )}
      
      {/* Results Display with Download Button */}
      {resultUrl && !loading && (
        <div className="results">
          <div className="result-box">
            <h3>Original</h3>
            <img src={preview} alt="Original" />
          </div>
          <div className="result-box">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3>ReVision AI</h3>
              <a 
                href={resultUrl} 
                download="revision-ai-result.jpg" 
                target="_blank" 
                rel="noreferrer"
                style={{
                  color: '#ec4899', 
                  textDecoration: 'none', 
                  fontSize: '0.9rem', 
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Download ⬇
              </a>
            </div>
            <img src={resultUrl} alt="Generated" />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
