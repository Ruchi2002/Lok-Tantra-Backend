import { useState, useEffect, useRef } from "react";

/**
 * Enhanced useSpeechToText hook with multi-language support
 * @param {string} lang - Language code (default: "en-US")
 * @returns {Object} - Object containing transcript, displayTranscript, isListening, startListening, stopListening, resetTranscript, isSupported, changeLanguage
 */
const useSpeechToText = (initialLang = "en-US") => {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState(""); // Clean transcript for form fields
  const [displayTranscript, setDisplayTranscript] = useState(""); // Display transcript with indicators
  const [isSupported, setIsSupported] = useState(false);
  const [currentLang, setCurrentLang] = useState(initialLang);
  const finalTranscriptRef = useRef("");

  // Initialize or reinitialize recognition when language changes
  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser");
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    
    // Clean up existing recognition if it exists
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = currentLang;

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";
      
      // Process all results from the beginning
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " ";
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      
      // Update the final transcript ref
      if (finalTranscript) {
        finalTranscriptRef.current = finalTranscriptRef.current + finalTranscript;
      }
      
      // Set the clean transcript (without indicators) for form fields
      const cleanTranscript = finalTranscriptRef.current + interimTranscript;
      setTranscript(cleanTranscript);
      
      // Set the display transcript with speaking indicator
      const speakingIndicator = interimTranscript ? " [बोल रहे हैं...]" : "";
      setDisplayTranscript(cleanTranscript + speakingIndicator);
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Clean up the display transcript when speech ends
      setDisplayTranscript(finalTranscriptRef.current.trim());
    };
    
    recognitionRef.current = recognition;

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [currentLang]);

  const startListening = () => {
    if (!isSupported || !recognitionRef.current) return;
    
    try {
      // Reset transcript refs when starting fresh
      finalTranscriptRef.current = "";
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error("Error starting speech recognition:", error);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (error) {
      console.error("Error stopping speech recognition:", error);
    }
  };

  const resetTranscript = () => {
    setTranscript("");
    setDisplayTranscript("");
    finalTranscriptRef.current = "";
  };

  const changeLanguage = (newLang) => {
    // Stop listening if currently active
    if (isListening) {
      stopListening();
    }
    setCurrentLang(newLang);
  };

  return { 
    transcript, // Clean transcript for form fields
    displayTranscript, // Display transcript with indicators
    isListening, 
    startListening, 
    stopListening, 
    resetTranscript, 
    isSupported,
    changeLanguage,
    currentLang
  };
};

export default useSpeechToText;