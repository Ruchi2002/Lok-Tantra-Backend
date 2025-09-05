// Field Agent API service
const API_BASE_URL = 'http://localhost:8000';

class FieldAgentApi {
  constructor() {
    this.baseURL = `${API_BASE_URL}/users`;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  }

  // Get auth headers
  getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Create a new Field Agent
  async createFieldAgent(fieldAgentData) {
    try {
      const response = await fetch(`${this.baseURL}/field-agent`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(fieldAgentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create Field Agent');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating Field Agent:', error);
      throw error;
    }
  }

  // Get all Field Agents for current tenant
  async getFieldAgents() {
    try {
      const response = await fetch(`${this.baseURL}/field-agents`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch Field Agents');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Field Agents:', error);
      throw error;
    }
  }

  // Get Field Agent details including password
  async getFieldAgentDetails(userId) {
    try {
      const response = await fetch(`${this.baseURL}/field-agent/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch Field Agent details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Field Agent details:', error);
      throw error;
    }
  }

  // Update Field Agent details
  async updateFieldAgent(userId, fieldAgentData) {
    try {
      const response = await fetch(`${this.baseURL}/field-agent/${userId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(fieldAgentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update Field Agent');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating Field Agent:', error);
      throw error;
    }
  }

  // Delete a Field Agent
  async deleteFieldAgent(userId) {
    try {
      const response = await fetch(`${this.baseURL}/${userId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete Field Agent');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting Field Agent:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const fieldAgentApi = new FieldAgentApi();
export default fieldAgentApi;
