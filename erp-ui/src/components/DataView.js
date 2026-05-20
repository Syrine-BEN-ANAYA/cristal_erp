import React from "react";

export default function DataView({ data }) {
  if (!data || !Array.isArray(data)) return null;

  return (
    <div style={{ marginTop: 20 }}>
      <h3>📊 Résultats</h3>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            {Object.keys(data[0] || {}).map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {Object.values(row).map((val, j) => (
                <td key={j}>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}