// incident-frontend/src/api.js
import { API_HOST } from './config';

const INCIDENT_URL = `${API_HOST}/incidents`;

/**
 * Fetches all incidents from the backend.
 */
export async function getIncidents() {
  const response = await fetch(INCIDENT_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch incidents');
  }
  return response.json();
}

/**
 * Creates a new incident.
 * @param {object} incidentData - { title, description, severity }
 */
export async function createIncident(incidentData) {
  const response = await fetch(INCIDENT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(incidentData),
  });

  if (!response.ok) {
    // Attempt to read error message from backend
    const errorBody = await response.json();
    throw new Error(errorBody.detail || `Failed to create incident: ${response.status}`);
  }
  return response.json();
}

/**
 * Updates the status of an existing incident.
 * @param {number} id - Incident ID
 * @param {string} status - New status (e.g., "In Progress")
 */
export async function updateIncidentStatus(id, status) {
  const response = await fetch(`${INCIDENT_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update incident status');
  }
  return response.json();
}
