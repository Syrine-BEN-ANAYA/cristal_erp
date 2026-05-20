import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import { FiTrash2, FiSend, FiCpu } from 'react-icons/fi';

import { askAI } from '../api/aiService';

import '../styles/AiPage.css';

const AiPage = ({ token }) => {

  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= SEND QUESTION =================
  const handleSend = async () => {

    if (!question.trim()) return;

    const userMessage = {
      sender: 'user',
      text: question,
    };

    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    try {

      const response = await askAI(question, token);

      const aiMessage = {
        sender: 'ai',
        text: response.answer,
        chartType: response.chartType,
        data: response.data,
        type: response.type,
      };

      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'AI service error',
        },
      ]);
    }

    setLoading(false);
    setQuestion('');
  };

  // ================= CLEAR CHAT =================
  const clearHistory = () => {
    setMessages([]);
  };

  // ================= CHART COLORS =================
  const COLORS = [
    '#2563eb',
    '#7c3aed',
    '#14b8a6',
    '#f97316',
    '#ef4444',
    '#22c55e',
  ];

  // ================= RENDER CHART =================
  const renderChart = (message) => {

    if (!message.data || !Array.isArray(message.data)) {
      return null;
    }

    // ================= BAR CHART =================
    if (message.chartType === 'bar') {

      return (
        <div className="chart-container">

          <ResponsiveContainer width="100%" height={320}>

            <BarChart data={message.data}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="name"
                angle={-10}
                textAnchor="end"
                interval={0}
                height={70}
              />

              <YAxis />

              <Tooltip />

              <Legend />

              <Bar
                dataKey={
                  message.type === 'TOP_REVENUE'
                    ? 'revenue'
                    : 'totalSold'
                }
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>
      );
    }

    // ================= PIE CHART =================
    if (message.chartType === 'pie') {

      return (
        <div className="chart-container">

          <ResponsiveContainer width="100%" height={320}>

            <PieChart>

              <Pie
                data={message.data}
                dataKey="totalSold"
                nameKey="name"
                outerRadius={110}
                label
              >
                {message.data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </div>
      );
    }

    // ================= TABLE =================
    if (message.chartType === 'table') {

      return (
        <div className="table-wrapper">

          <table className="ai-table">

            <thead>
              <tr>
                {Object.keys(message.data[0] || {}).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>

            <tbody>

              {message.data.map((row, index) => (

                <tr key={index}>

                  {Object.values(row).map((value, i) => (
                    <td key={i}>{String(value)}</td>
                  ))}

                </tr>
              ))}

            </tbody>

          </table>

        </div>
      );
    }

    return null;
  };

  return (

    <div className="ai-page">

      {/* ================= HEADER ================= */}
      <div className="ai-header">

        <div className="ai-header-left">

          <div className="ai-icon-wrapper">
            <FiCpu size={28} />
          </div>

          <div>
            <h1>AI ERP Assistant</h1>
            <p>
              Ask about products, revenue, inventory and ERP analytics.
            </p>
          </div>

        </div>

        <button
          className="clear-btn"
          onClick={clearHistory}
        >
          <FiTrash2 />
          Clear History
        </button>

      </div>

     
      {/* ================= CHAT ================= */}
      <div className="chat-container">

        {messages.length === 0 && (
          <div className="empty-chat">
            <FiCpu size={52} />
            <h2>ERP AI Assistant</h2>
            <p>
              Start asking questions about your ERP data.
            </p>
          </div>
        )}

        {messages.map((msg, index) => (

          <div
            key={index}
            className={`message ${msg.sender}`}
          >

            <div className="message-bubble">

              <p>{msg.text}</p>

              {msg.sender === 'ai' && renderChart(msg)}

            </div>

          </div>
        ))}

        {loading && (
          <div className="message ai">
            <div className="message-bubble loading-bubble">
              <p>AI is analyzing your ERP data...</p>
            </div>
          </div>
        )}

      </div>

      {/* ================= INPUT ================= */}
      <div className="input-container">

        <input
          type="text"
          placeholder="Ask AI "
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
        />

        <button onClick={handleSend}>
          <FiSend />
          Send
        </button>

      </div>

    </div>
  );
};

export default AiPage;