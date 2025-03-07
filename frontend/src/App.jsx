import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Chat from "./chat";
import { useEffect, useState, useRef } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { FaCircle } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import { API_BASE_URL } from "./config";

function App() {
  const [selectedLLM, setSelectedLLM] = useState("llama3.2:3b");
  const [llmList, setLlmList] = useState([]);
  const [newModel, setNewModel] = useState("");
  const [progress, setProgress] = useState("");
  const newModelRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/models`)
      .then((response) => response.json())
      .then((data) => {
        let llms = data.models.map((llm) => ({
          model: llm.model,
          family: llm.details.family,
          parameter_size: llm.details.parameter_size,
        }));
        setLlmList(llms);
      })
      .catch((error) => console.error("Error fetching models:", error));
  }, []);

  const addModel = async () => {
    //  deepseek-r1:1.5b
    try {
      const res = await fetch(`${API_BASE_URL}/models`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: newModel }),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          setProgress("New model added successfully! Reload the page.");
          setNewModel("");
          newModelRef.current.value = "";
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        console.log(chunk);
        setProgress(chunk);
      }
    } catch (error) {}
  };

  return (
    <div className="container-fluid">
      <div className="row ">
        <div className="col-2 side_nav">
          <div className="top_section_2">
            <h3 className="text-center mt-3">
              <img src="./logo.png" className="img-fluid" alt="" />
            </h3>
            <p className="text-center mt-3">Select your LLM</p>

            {llmList.map((llm) => (
              <div
                className="link"
                key={llm.model}
                onClick={() => setSelectedLLM(llm.model)}
              >
                {llm.model.split(":")[0].toUpperCase()} ({llm.parameter_size})
                {selectedLLM === llm.model && (
                  <FaCircleCheck className="text-success" />
                )}
                {selectedLLM !== llm.model && (
                  <FaCircle className="text-info" />
                )}
              </div>
            ))}
          </div>

          <div className="bottom_section_2 p-1">
            <div className="text-center">Add New Model</div>
            <div className="row p-0 m-0">
              <div className="col-10 p-0 ">
                <input
                  type="text"
                  placeholder="Model name"
                  ref={newModelRef}
                  onChange={(e) => setNewModel(e.target.value)}
                  disabled={progress !== ""}
                />
              </div>
              <div className="col-2 p-0 ">
                <button
                  onClick={addModel}
                  className="btn_style"
                  disabled={progress !== ""}
                >
                  <FaPlus />
                </button>
              </div>
            </div>
            <div className="col-12 p-0">{progress}</div>
          </div>
        </div>
        <div className="col-10 p-0">
          <div className="all_chat">
            <Chat selectedLLM={selectedLLM} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
