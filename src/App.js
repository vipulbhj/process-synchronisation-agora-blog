import React, { useState } from "react";
import ChatPage from "./Pages/Chat";
import "./App.css";

function App() {
  const [state, setstate] = useState({
    showProcessSelectionScreen: true,
    selectedProcess: null,
  });

  const processSelectionHandler = (process) => {
    setstate({
      showProcessSelectionScreen: false,
      selectedProcess: process,
    });
  };

  return (
    <div className="App">
      {state.showProcessSelectionScreen ? (
        <>
          <h1>Select the process you want to start</h1>
          <button onClick={() => processSelectionHandler("main")}>
            Main Process
          </button>
          <button onClick={() => processSelectionHandler("other")}>
            Other Process
          </button>
        </>
      ) : null}

      {state.selectedProcess === "main" ? (
        <ChatPage name="Main Process" channelName="blog-demo" uid="2121" />
      ) : state.selectedProcess === "other" ? (
        <ChatPage name="Other Process" channelName="blog-demo" uid="3131" />
      ) : null}
    </div>
  );
}

export default App;
