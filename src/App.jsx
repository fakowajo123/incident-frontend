// incident-frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { getIncidents, createIncident, updateIncidentStatus } from './api';
import './App.css'; // We'll update the CSS next

const SEVERITIES = ["Critical", "High", "Medium", "Low"];
const STATUSES = ["Open", "In Progress", "Resolved", "Closed"];

function App() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    severity: SEVERITIES[0] 
  });

  // --- Data Fetching Logic ---
  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const data = await getIncidents();
      setIncidents(data);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      alert("Failed to load incidents. Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    // Set up a refresh timer to automatically pull new incidents every 10 seconds
    const interval = setInterval(fetchIncidents, 10000);
    return () => clearInterval(interval);
  }, []);

  // --- Form Handling ---
  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- handleCreate function ---

const handleCreate = async (e) => {
    e.preventDefault();
    try {
        await createIncident(formData);
        setFormData({ title: '', description: '', severity: SEVERITIES[0] }); // Reset form
        fetchIncidents(); // Refresh the list
        alert("Incident submitted successfully!");
    } catch (error) {
        // --- CORRECTED FIX ---
        console.error("Error creating incident:", error);

        // Since the API client now guarantees a clean Error object, 
        // we can safely read the .message property, avoiding [object Object].
        let errorMessage = error.message || "An unknown network error occurred.";
        
        alert(`Submission Failed: ${errorMessage}`);
    }
};

// ... (rest of the file remains the same)

  // --- Status Update Handler ---
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateIncidentStatus(id, newStatus);
      fetchIncidents(); // Refresh the list
    } catch (error) {
      console.error("Error updating status:", error);
      alert(`Error updating status: ${error.message}`);
    }
  };

  if (loading) return <div className="container">Loading incidents...</div>;

  return (
    <div className="container">
      <h1>Incident Management Dashboard</h1>

      {/* --- Incident Creation Form --- */}
      <div className="card form-card">
        <h2>Create New Incident</h2>
        <form onSubmit={handleCreate}>
          <input
            type="text"
            name="title"
            placeholder="Title (e.g., Database primary is down)"
            value={formData.title}
            onChange={handleFormChange}
            required
          />
          <textarea
            name="description"
            placeholder="Detailed description of the issue..."
            value={formData.description}
            onChange={handleFormChange}
            required
          />
          <select name="severity" value={formData.severity} onChange={handleFormChange}>
            {SEVERITIES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button type="submit">Submit Incident</button>
        </form>
      </div>

      {/* --- Incident List Table --- */}
      <div className="card list-card">
        <h2>Open Incidents ({incidents.length})</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr key={incident.id} className={`severity-${incident.severity.toLowerCase().replace(' ', '-')}`}>
                <td>{incident.id}</td>
                <td>{incident.title}</td>
                <td>{incident.severity}</td>
                <td>{incident.status}</td>
                <td>{new Date(incident.created_at).toLocaleString()}</td>
                <td>
                  <select 
                    value={incident.status} 
                    onChange={(e) => handleStatusChange(incident.id, e.target.value)}
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {incidents.length === 0 && <p style={{textAlign: 'center', margin: '20px'}}>No incidents currently open!</p>}
      </div>
    </div>
  );
}

export default App;