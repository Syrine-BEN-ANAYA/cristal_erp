import React from "react";

export default function MessageBubble({ message }) {
  return (
    <div style={{ marginTop: 15 }}>
      <div style={{ fontWeight: "bold" }}>
        👤 {message.question}
      </div>

      <div style={{ marginTop: 5 }}>
        🤖 {message.answer}
      </div>
    </div>
  );
}