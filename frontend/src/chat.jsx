import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import { marked } from "marked";
import { FaCircleStop } from "react-icons/fa6";
import { FaCircleUp } from "react-icons/fa6";
import { FaCircleXmark } from "react-icons/fa6";
import { API_BASE_URL } from "./config";

const Chat = ({ selectedLLM }) => {
  const [prompt, setPrompt] = useState("");
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const abortControllerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  // const [thinking, setThinking] = useState("");
  // const [open, setOpen] = useState(false);

  useEffect(() => {
    setResponse("");
    setPrompt("");
    setQuestion("");
    // setThinking("");
  }, [selectedLLM]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponse("");
    setLoading(true);
    setQuestion(prompt);
    abortControllerRef.current = new AbortController();
    // setThinking("");

    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: selectedLLM, prompt: prompt }),
        signal: abortControllerRef.current.signal, // Pass the signal to the fetch
      });

      if (!res.ok) {
        console.error("Failed to fetch response");
        setLoading(false);
        return;
      }

      // Handle streaming response
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";
      let is_cleaned = false;
      let cleanedData = "";
      let thinkData = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // if (selectedLLM === "deepseek-r1:1.5b") {
        //   if (chunk.includes("</think>")) {
        //     is_cleaned = true;
        //   }

        //   if (is_cleaned && !chunk.includes("</think>")) {
        //     cleanedData += chunk;
        //     let res = marked.parse(cleanedData);
        //     setResponse(res);
        //   } else {
        //     thinkData += chunk;
        //     let res = marked.parse(thinkData);
        //     // setThinking(res);
        //   }
        // } else {
        aiResponse += chunk;

        let res = marked.parse(aiResponse);
        setResponse(res);
        // }
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error in streaming:", error);
      }
    } finally {
      setPrompt("");
      setLoading(false);
    }
  };

  const clearChat = () => {
    setResponse("");
    setPrompt("");
    setQuestion("");
    // setThinking("");
  };

  const stopChat = () => {
    setResponse(
      (prevResponse) => prevResponse + "😬 OOPS...!, You have to stop the chat"
    );

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <div className="chat_container row m-0 p-0 justify-content-center">
      <div className="top_section col-12 p-0 m-0">
        {question && (
          <div className="d-flex justify-content-end ">
            <div className="question p-3">{question} : 🧑‍💻</div>
          </div>
        )}
        {!response && !loading && <div>🚀 Ask me anything...!</div>}

        {loading ? (
          <span>
            <span className="spinner-border spinner-border-sm me-2"></span>
            Thinking ... 🤔
          </span>
        ) : null}

        {/* {thinking && (
          <>
            <div className="text-secondary">
              I was Talking to My Self, Do you want to check out ...
              <button className="btn_style ms-5" onClick={() => setOpen(!open)}>
                {open ? "No, It's fine" : "Yes, Show me"}
              </button>
            </div>

            {open && (
              <div
                className="thinking my-2"
                id="thinking"
                dangerouslySetInnerHTML={{ __html: thinking }}
              ></div>
            )}
          </>
        )} */}

        {response && (
          <div
            className="response"
            id="response"
            dangerouslySetInnerHTML={{ __html: response }}
          ></div>
        )}
      </div>

      <div className="bottom_section col-11 p-0 m-0">
        <div className="d-flex align-items-center px-3 ">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask something..."
            onKeyDown={handleKeyDown}
            disabled={loading}
          ></textarea>

          <div className="d-flex align-items-center">
            <button
              disabled={loading || prompt === ""}
              className="btn_style ms-3"
              onClick={handleSubmit}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                <FaCircleUp />
              )}
            </button>
            <button className="btn_style ms-3" onClick={stopChat}>
              <FaCircleStop />
            </button>
            <button className="btn_style ms-3" onClick={clearChat}>
              <FaCircleXmark />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
