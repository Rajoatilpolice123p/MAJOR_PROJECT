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
  "Romantic", "Energetic", "Peaceful", "DISGUST",
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const playerRef = useRef(null);

  // Load YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  }, []);

  // Initialize player when playlist or currentIndex changes
  useEffect(() => {
    if (!playlist.length || !window.YT) return;

    if (playerRef.current) playerRef.current.destroy();

    setTimeout(() => {
      playerRef.current = new window.YT.Player("ytplayer", {
        height: "200",
        width: "100%",
        videoId: playlist[currentIndex].id,
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              handleNext();
            }
          },
        },
        playerVars: { autoplay: 1 },
      });
    }, 100);
  }, [playlist, currentIndex]);

  // Webcam setup
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

  const handleCapture = async () => {
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
  };

  const handleGetPlaylist = async () => {
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
      const response = await getPlaylist(mood, language);
      setPlaylist(response);
      setCurrentIndex(0);
      setShowControls(false);
    } catch (err) {
      console.error("Playlist fetch error:", err);
      alert("Failed to fetch playlist.");
    }
    setLoading(false);
  };

  const handleUpdatePlaylist = async () => {
    await handleGetPlaylist(); // re-fetch playlist
  };

  const handleReset = () => {
    setPlaylist([]);
    setShowControls(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  const handleSelectSong = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div style={{ minHeight: "100vh", padding: "10px", background: "linear-gradient(to right, #ff7e5f, #feb47b, #86A8E7, #91EAE4)", color: "#fff", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 500, margin: "auto", backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 20, padding: "20px", boxShadow: "0 8px 16px rgba(0,0,0,0.4)" }}>
        <h1 style={{ textAlign: "center", marginBottom: 20, textShadow: "2px 2px 5px #000", fontSize: "1.5em" }}>🎵 Emotion Music Player 🎵</h1>

        {showControls && (
          <>
            <div style={{ marginBottom: 15, display: "flex", flexDirection: "column" }}>
              <label style={{ marginBottom: 5 }}>Select Language: </label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ padding: "8px", borderRadius: 10, border: "none", outline: "none", fontSize: "1em" }}>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 15 }}>
              <button onClick={() => setManualMode(!manualMode)} style={{ width: "100%", padding: "10px", borderRadius: 20, border: "none", background: "#ff4e50", color: "#fff", cursor: "pointer", boxShadow: "0 4px 8px rgba(0,0,0,0.3)", fontSize: "1em", marginBottom: 10 }}>
                {manualMode ? "Switch to Webcam Mode" : "Choose Mood Manually"}
              </button>
            </div>

            {!manualMode && (
              <div style={{ marginBottom: 15, textAlign: "center" }}>
                <video ref={videoRef} autoPlay style={{ width: "100%", maxWidth: 320, borderRadius: 15, border: "3px solid #fff", boxShadow: "0 4px 8px rgba(0,0,0,0.5)" }} />
                <button onClick={handleCapture} disabled={loading} style={{ marginTop: 10, width: "100%", padding: "10px", borderRadius: 20, border: "none", background: "#1fddff", color: "#000", cursor: "pointer", fontSize: "1em" }}>
                  {loading ? "Detecting..." : "Detect Emotion"}
                </button>
              </div>
            )}

            {manualMode && (
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: "block", marginBottom: 5 }}>Select Mood:</label>
                <select value={emotion} onChange={(e) => setEmotion(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: 10, border: "none", outline: "none", fontSize: "1em" }}>
                  <option value="">Choose</option>
                  {EMOTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            )}

            <button onClick={handleGetPlaylist} disabled={loading} style={{ width: "100%", padding: "10px", borderRadius: 20, border: "none", background: "#6a11cb", color: "#fff", cursor: "pointer", fontSize: "1em", marginBottom: 10 }}>
              {loading ? "Loading Playlist..." : "Get Playlist"}
            </button>
          </>
        )}

        {!showControls && playlist.length > 0 && (
          <div>
            {/* Display selected language and mood */}
            <div style={{ textAlign: "center", marginBottom: 10 }}>
              <p style={{ margin: 0, fontSize: "1em" }}>
                🎵 Language: <strong>{language}</strong> | Mood: <strong>{emotion}</strong>
              </p>
            </div>

            {/* YouTube Player */}
            <div id="ytplayer" style={{ width: "100%", height: "200px" }}></div>
            <h4 style={{ marginTop: 10, textAlign: "center" }}>{playlist[currentIndex].title}</h4>

            {/* Player Controls */}
            <div style={{ marginTop: 10, textAlign: "center" }}>
              <button onClick={handlePrevious} style={{ marginRight: 10, padding: "8px 16px", borderRadius: 15, border: "none", background: "#2575fc", color: "#fff", cursor: "pointer" }}>⏮ Previous</button>
              <button onClick={handleNext} style={{ padding: "8px 16px", borderRadius: 15, border: "none", background: "#6a11cb", color: "#fff", cursor: "pointer" }}>⏭ Next</button>
            </div>

            {/* Upcoming Songs */}
            <div style={{ marginTop: 20 }}>
              <h4 style={{ textAlign: "center" }}>Upcoming Songs</h4>
              <div style={{ display: "flex", flexDirection: "column", maxHeight: "300px", overflowY: "auto", padding: "10px 0" }}>
                {playlist.map((song, index) => (
                  <div key={song.id} onClick={() => handleSelectSong(index)} style={{ cursor: "pointer", display: "flex", alignItems: "center", marginBottom: 10, padding: 5, borderRadius: 10, backgroundColor: index === currentIndex ? "rgba(255,255,255,0.2)" : "transparent" }}>
                    <img src={song.thumbnail} alt={song.title} style={{ width: 60, height: 40, borderRadius: 5, marginRight: 10 }} />
                    <p style={{ fontSize: "0.9em", margin: 0 }}>{song.title.length > 30 ? song.title.slice(0, 30) + "..." : song.title}</p>
                    {index === currentIndex && <span style={{ marginLeft: 10, color: "#ffd700", fontWeight: "bold" }}>Now Playing</span>}
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleReset} style={{ marginTop: 10, width: "100%", padding: "10px", borderRadius: 15, border: "none", background: "#ff4e50", color: "#fff", cursor: "pointer" }}>
              Change Mood/Language
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
