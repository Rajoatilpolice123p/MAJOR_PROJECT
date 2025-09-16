export async function detectEmotion(imageBase64) {
  const res = await fetch(
    "https://2kydru7c5e.execute-api.us-east-1.amazonaws.com/dev/detect-emotion",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64 }),
    }
  );

  const data = await res.json();
  const bodyData = JSON.parse(data.body); // Parse Lambda stringified body
  return bodyData.emotion; // Returns the actual emotion string
}


export async function getPlaylist(emotion, language) {
  try {
    const res = await fetch(
      "https://2kydru7c5e.execute-api.us-east-1.amazonaws.com/dev/get-playlist",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emotion, language }),
      }
    );

    if (!res.ok) throw new Error("Network response not ok");

    const data = await res.json();

    // Parse the 'body' string into an object
    const parsedBody = typeof data.body === "string" ? JSON.parse(data.body) : data.body;

    return parsedBody.playlist || [];
  } catch (err) {
    console.error("API error:", err);
    return [];
  }
}

