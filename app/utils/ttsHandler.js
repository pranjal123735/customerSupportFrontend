import axios from "axios";

/**
 * Generate speech from text and play it using the new TTS API format
 *
 * Backend flow:
 * 1. POST /api/voice/tts with text → returns JSON with file_path
 * 2. GET /api/voice/audio/:filename → returns WAV audio blob
 * 3. Play audio using HTML5 Audio element
 *
 * @param {string} text - Text to convert to speech
 * @param {string} backendUrl - Backend URL (defaults to NEXT_PUBLIC_BACKEND_URL env var)
 * @returns {Promise<{audio: Audio, audioUrl: string, cleanup: Function}>}
 * @throws {Error} If text is empty, TTS generation fails, or audio download fails
 */
async function generateAndPlaySpeech(
  text,
  backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000",
) {
  try {
    // Validate input
    if (!text || !text.trim()) {
      throw new Error("Text cannot be empty");
    }

    console.log(
      "🔊 TTS: Generating audio for text:",
      text.substring(0, 50) + "...",
    );

    // Step 1: Request TTS generation from backend
    const ttsResponse = await axios.post(
      `${backendUrl}/api/voice/tts`,
      { text },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    // Step 2: Validate TTS response
    if (ttsResponse.status !== 200) {
      throw new Error(`TTS endpoint returned status ${ttsResponse.status}`);
    }

    const ttsData = ttsResponse.data;

    // Check for backend error
    if (ttsData.status === "error") {
      throw new Error(ttsData.error || "TTS generation failed");
    }

    // Check for required fields
    if (!ttsData.file_path) {
      throw new Error("Invalid TTS response: missing file_path");
    }

    console.log("✅ TTS: Audio generated at", ttsData.file_path);

    // Step 3: Extract filename from file_path and download audio
    const filename = ttsData.file_path.split("/").pop();

    if (!filename) {
      throw new Error("Could not extract filename from response");
    }

    console.log("📥 TTS: Downloading audio file:", filename);

    const audioResponse = await axios.get(
      `${backendUrl}/api/voice/audio/${filename}`,
      {
        responseType: "blob",
        headers: {
          Accept: "audio/*",
        },
      },
    );

    // Step 4: Validate audio response
    if (audioResponse.status !== 200) {
      throw new Error(
        `Audio download failed with status ${audioResponse.status}`,
      );
    }

    const audioBlob = audioResponse.data;

    if (!audioBlob || audioBlob.size === 0) {
      throw new Error("Downloaded audio file is empty");
    }

    console.log("✅ TTS: Audio downloaded, size:", audioBlob.size, "bytes");

    // Step 5: Create audio object and play
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    console.log("🎵 TTS: Playing audio...");
    await audio.play().catch((err) => {
      console.error("Failed to play audio:", err);
      throw new Error(`Audio playback failed: ${err.message}`);
    });

    // Step 6: Setup cleanup function to revoke URL when done
    // NOTE: Caller is responsible for calling cleanup() when audio is no longer needed
    const cleanup = () => {
      audio.pause();
      audio.currentTime = 0;
      URL.revokeObjectURL(audioUrl);
      console.log("🧹 TTS: Cleaned up audio resources");
    };

    return {
      audio,
      audioUrl,
      cleanup,
      filename,
      size: audioBlob.size,
      mimeType: ttsData.mimeType || audioBlob.type,
    };
  } catch (error) {
    console.error("❌ TTS Error:", error.message);
    throw error;
  }
}

export default generateAndPlaySpeech;
