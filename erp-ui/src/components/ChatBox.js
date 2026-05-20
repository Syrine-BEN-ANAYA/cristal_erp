import React, { useState } from "react";
import { askAI } from "../api/aiService";

export default function ChatBox({ onResponse }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!question) return;

    setLoading(true);

    const res = await askAI(question);

    onResponse({
      question,
      answer: res.answer,
      data: res.data,
    });

    setQuestion("");
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", gap: 10 }}>
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Pose une question sur les ventes..."
        style={{
          flex: 1,
          padding: 10,
          borderRadius: 8,
          border: "1px solid #ccc",
        }}
      />

      <button onClick={handleSend} disabled={loading}>
        {loading ? "..." : "Envoyer"}
      </button>
    </div>
  );
}