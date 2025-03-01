import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../style/Music.css";

const API_KEY = "AIzaSyBYLqfxR2YumKGa8FWkb4D5oudVbzeUhmI"; // Replace with your YouTube API Key

const ClassicMusicPlayer = ({ socket, roomId }) => {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const playerRef = useRef(null);
  const progressInterval = useRef(null);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load YouTube API script and initialize the player
  useEffect(() => {
    if (!window.YT) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.body.appendChild(script);
    }

    window.onYouTubeIframeAPIReady = () => {
      console.log("YouTube API Loaded");
    };
  }, []);

  // Handle socket events
  useEffect(() => {
    const handleMusicEvent = ({ action, videoId, seekTime, title, thumbnail }) => {
      if (action === "play" && videoId) {
        setCurrentVideo({ id: videoId, seekTime: seekTime || 0, title, thumbnail });
      } else if (action === "pause" && playerRef.current) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else if (action === "seek" && playerRef.current) {
        playerRef.current.seekTo(seekTime);
        setProgress((seekTime / playerRef.current.getDuration()) * 100);
      }
    };

    socket.on("receiveMusic", handleMusicEvent);
    return () => socket.off("receiveMusic", handleMusicEvent);
  }, [socket]);

  // Initialize or update YouTube Player
  // Initialize or update YouTube Player
useEffect(() => {
  if (currentVideo) {
    if (!playerRef.current) {
      // Initialize the player
      playerRef.current = new window.YT.Player("youtube-player", {
        height: "0",
        width: "0",
        videoId: currentVideo.id,
        playerVars: { autoplay: 1, controls: 0 },
        events: {
          onReady: (event) => {
            if (currentVideo.seekTime) {
              event.target.seekTo(currentVideo.seekTime);
            }
            event.target.playVideo();
            setIsPlaying(true);
            startProgressUpdate();
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              clearInterval(progressInterval.current);
            }
          },
        },
      });
    } else {
      // Ensure the playerRef is valid before using it
      if (typeof playerRef.current.loadVideoById === "function") {
        playerRef.current.loadVideoById(currentVideo.id);
        if (currentVideo.seekTime) {
          playerRef.current.seekTo(currentVideo.seekTime);
        }
        playerRef.current.playVideo();
        setIsPlaying(true);
        startProgressUpdate();
      } else {
        console.error("YouTube Player not initialized properly.");
      }
    }
  }
}, [currentVideo]);


  // Progress bar update
  const startProgressUpdate = () => {
    clearInterval(progressInterval.current);

    progressInterval.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getDuration) {
        const duration = playerRef.current.getDuration();
        const currentTime = playerRef.current.getCurrentTime();
        if (duration) {
          setProgress((currentTime / duration) * 100);
          socket.emit("sendMusic", { action: "syncProgress", roomId, currentTime });
        }
      }
    }, 1000);
  };

  // Seek function
  const handleSeek = (event) => {
    if (playerRef.current) {
      const seekTime = (event.target.value / 100) * playerRef.current.getDuration();
      console.log("Seeking to:", seekTime);
      playerRef.current.seekTo(seekTime);
      setProgress(event.target.value);
      socket.emit("sendMusic", { action: "seek", roomId, seekTime });
    }
  };

  // Play and Pause
  const playMusic = () => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime(); // Get current paused time
  
      socket.emit("sendMusic", {
        action: "play",
        roomId,
        videoId: currentVideo.id,
        title: currentVideo.title,
        thumbnail: currentVideo.thumbnail,
        seekTime: currentTime, // Send last paused time
      });
  
      playerRef.current.seekTo(currentTime); // Ensure seeking to correct position
      playerRef.current.playVideo();
      setIsPlaying(true);
      startProgressUpdate();
    }
  };
  
  

  const pauseMusic = () => {
    socket.emit("sendMusic", { action: "pause", roomId });
    if (playerRef.current) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    }
  };

  // Fetch YouTube Videos
  const searchMusic = async () => {
    try {
      const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          part: "snippet",
          q: query + " song",
          type: "video",
          maxResults: 5,
          key: API_KEY,
        },
        headers: { Accept: "application/json" }, // Ensure JSON response
      });

      setVideos(response.data.items);
    } catch (error) {
      console.error("Error fetching music videos:", error);
    }
  };

  return (
    <div className="classic-container">
      <div id="youtube-player" style={{ display: "none" }}></div>

      <div className="classic-player">
        {currentVideo ? (
          <>
            <h2>Now Playing 🎵</h2>
            <img src={currentVideo.thumbnail} alt={currentVideo.title} className="music-image" />
            <h3>{currentVideo.title}</h3>

            <input type="range" value={progress} onChange={handleSeek} className="seek-bar" />

            <div className="music-controls">
              <button onClick={playMusic} disabled={isPlaying}>▶ Play</button>
              <button onClick={pauseMusic} disabled={!isPlaying}>⏸ Pause</button>
            </div>
          </>
        ) : (
          <p>Select a song to play 🎶</p>
        )}
      </div>

      <div className="classic-search">
        <input
          type="text"
          placeholder="Search music..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={searchMusic}>🔍 Search</button>
      </div>

      <ul className="classic-list">
        {videos.map((video) => (
          <li
            key={video.id.videoId}
            className="classic-item"
            onClick={() => {
              const selectedVideo = {
                id: video.id.videoId,
                title: video.snippet.title,
                thumbnail: video.snippet.thumbnails.medium.url,
              };

              socket.emit("sendMusic", {
                action: "play",
                roomId,
                videoId: selectedVideo.id,
                title: selectedVideo.title,
                thumbnail: selectedVideo.thumbnail,
                seekTime: 0,
              });

              setCurrentVideo(selectedVideo);
            }}
          >
            <img src={video.snippet.thumbnails.default.url} alt={video.snippet.title} />
            <span>{video.snippet.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClassicMusicPlayer;