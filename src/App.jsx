import React, { useState, useRef, useEffect } from "react";
import { detectEmotion, getPlaylist } from "./api";

const LANGUAGES = [
  "English", "Hindi", "Punjabi", "Kannada", "Tamil", "Telugu",
  "Malayalam", "Marathi", "Bengali", "Gujarati", "Odia", "Assamese",
  "Urdu", "Arabic", "Spanish", "French", "German", "Italian", "Portuguese",
  "Russian", "Chinese", "Japanese", "Korean", "Turkish", "Vietnamese",
  "Thai", "Indonesian", "Persian", "Swahili"
];

const EMOTIONS = [
  "HAPPY", "SAD", "CALM", "ANGRY", "FEAR", "Mass", 
  "Romantic", "Energetic", "Peaceful","DISGUST", 
  "CONFUSED", "EXCITED", "RELAXED", "BORED", "NEUTRAL", "ANXIOUS",
  "LOVING", "SILLY", "CONTENT", "FRUSTRATED", "TIRED", "SURPRISED"
];

function App() {
  const [emotion, setEmotion] = useState("");
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [playlist, setPlaylist] = useState([]);
  const [manualMode, setManualMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (!manualMode && showControls) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch((err) => console.error("Webcam error:", err));
    }
  }, [manualMode, showControls]);

  async function handleCapture() {
    if (!videoRef.current) return;
    setLoading(true);

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

    const imageBase64 = canvas.toDataURL("image/jpeg").split(",")[1];

    try {
      const detectedEmotion = await detectEmotion(imageBase64);
      setEmotion(detectedEmotion);
    } catch (err) {
      console.error("Emotion detection error:", err);
      alert("Failed to detect emotion.");
    }

    setLoading(false);
  }

  async function handleGetPlaylist() {
    let mood = emotion;

    if (manualMode && !emotion) {
      mood = prompt("Enter your mood (e.g., HAPPY, SAD)");
      setEmotion(mood);
    }

    if (!mood || !LANGUAGES.includes(language)) {
      alert("Please select a mood and language.");
      return;
    }

    setLoading(true);
    try {
      const list = await getPlaylist(mood, language);
      setPlaylist(list);
      setShowControls(false);
    } catch (err) {
      console.error("Playlist fetch error:", err);
      alert("Failed to fetch playlist.");
    }
    setLoading(false);
  }

  function handleReset() {
    setPlaylist([]);
    setShowControls(true);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "10px",
        background: "linear-gradient(to right, #ff7e5f, #feb47b, #86A8E7, #91EAE4)",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 500,
          margin: "auto",
          backgroundColor: "rgba(0,0,0,0.6)",
          borderRadius: 20,
          padding: "20px",
          boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: 20, textShadow: "2px 2px 5px #000", fontSize: "1.5em" }}>
          🎵 Emotion Music Player 🎵
        </h1>

        {showControls && (
          <>
            <div style={{ marginBottom: 15, display: "flex", flexDirection: "column" }}>
              <label style={{ marginBottom: 5 }}>Select Language: </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  padding: "8px",
                  borderRadius: 10,
                  border: "none",
                  outline: "none",
                  fontSize: "1em",
                }}
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 15 }}>
              <button
                onClick={() => setManualMode(!manualMode)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 20,
                  border: "none",
                  background: "#ff4e50",
                  color: "#fff",
                  cursor: "pointer",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                  fontSize: "1em",
                  marginBottom: 10
                }}
              >
                {manualMode ? "Switch to Webcam Mode" : "Choose Mood Manually"}
              </button>
            </div>

            {!manualMode && (
              <div style={{ marginBottom: 15, textAlign: "center" }}>
                <video
                  ref={videoRef}
                  autoPlay
                  style={{ width: "100%", maxWidth: 320, borderRadius: 15, border: "3px solid #fff", boxShadow: "0 4px 8px rgba(0,0,0,0.5)" }}
                />
                <button
                  onClick={handleCapture}
                  disabled={loading}
                  style={{
                    marginTop: 10,
                    width: "100%",
                    padding: "10px",
                    borderRadius: 20,
                    border: "none",
                    background: "#1fddff",
                    color: "#000",
                    cursor: "pointer",
                    fontSize: "1em",
                  }}
                >
                  {loading ? "Detecting..." : "Detect Emotion"}
                </button>
              </div>
            )}

            {manualMode && (
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: "block", marginBottom: 5 }}>
                  Select Mood:
                </label>
                <select
                  value={emotion}
                  onChange={(e) => setEmotion(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: 10,
                    border: "none",
                    outline: "none",
                    fontSize: "1em",
                  }}
                >
                  <option value="">Choose</option>
                  {EMOTIONS.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleGetPlaylist}
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 20,
                border: "none",
                background: "#6a11cb",
                color: "#fff",
                cursor: "pointer",
                fontSize: "1em",
              }}
            >
              {loading ? "Loading Playlist..." : "Get Playlist"}
            </button>
          </>
        )}

        {!showControls && (
          <div style={{ marginBottom: 15, textAlign: "center" }}>
            <label style={{ display: "block", marginBottom: 5 }}>
              Change Mood:
            </label>
            <select
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
              style={{ padding: "8px", borderRadius: 10, border: "none", marginBottom: 10, width: "100%" }}
            >
              {EMOTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>

            <label style={{ display: "block", marginBottom: 5 }}>Language:</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{ padding: "8px", borderRadius: 10, border: "none", width: "100%" }}
            >
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>

            <button
              onClick={handleGetPlaylist}
              style={{ marginTop: 10, width: "100%", padding: "10px", borderRadius: 15, border: "none", background: "#6a11cb", color: "#fff", cursor: "pointer" }}
            >
              Update Playlist
            </button>
            <button
              onClick={handleReset}
              style={{ marginTop: 10, width: "100%", padding: "10px", borderRadius: 15, border: "none", background: "#ff4e50", color: "#fff", cursor: "pointer" }}
            >
              Change Mood/Language
            </button>
          </div>
        )}

        {playlist.length > 0 && (
          <div style={{ marginTop: 25 }}>
            <h3 style={{ textAlign: "center", fontSize: "1.2em" }}>🎶 Recommended Songs 🎶</h3>
            {playlist.map((song) => (
              <div key={song.id} style={{ marginBottom: 20, backgroundColor: "rgba(255,255,255,0.1)", padding: 10, borderRadius: 10 }}>
                <h4 style={{ textAlign: "center", fontSize: "1em" }}>{song.title}</h4>
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  style={{ display: "block", margin: "10px auto", maxWidth: "100%", borderRadius: 10 }}
                />
                <iframe
                  width="100%"
                  height="200"
                  src={`https://www.youtube.com/embed/${song.id}`}
                  title={song.title}
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  style={{ display: "block", margin: "10px auto", borderRadius: 10 }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
