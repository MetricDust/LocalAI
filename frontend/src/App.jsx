import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Chat from "./chat";
import { useEffect, useState } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { FaCircle } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import { API_BASE_URL } from "./config";

function App() {
  const [selectedLLM, setSelectedLLM] = useState("llama3.2:3b");
  const [llmList, setLlmList] = useState([]);
  const [newModel, setNewModel] = useState("");

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

    const eventSource = new EventSource(`${API_BASE_URL}/models`);
    eventSource.onmessage = (event) => {
      console.log(event.data);
    };
  }, []);

  const addModel = async () => {
    //  deepseek-r1:1.5b
    console.log(newModel);

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
      const { value, done } = await reader.read();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        console.log(decoder.decode(value));
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
                  onChange={(e) => setNewModel(e.target.value)}
                />
              </div>
              <div className="col-2 p-0 ">
                <button onClick={addModel} className="btn_style">
                  <FaPlus />
                </button>
              </div>
            </div>
            <div></div>
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
