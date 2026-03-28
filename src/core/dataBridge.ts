// Simple data bridge to allow tools to exchange outputs
// In a real app, this would likely be a Context or Redux store
// For now, we use a simple singleton pattern to store and retrieve data

interface DataStore {
  [key: string]: any;
}

class DataBridge {
  private store: DataStore = {};
  private listeners: { [key: string]: Function[] } = {};

  setData(key: string, data: any) {
    this.store[key] = data;
    if (this.listeners[key]) {
      this.listeners[key].forEach(callback => callback(data));
    }
  }

  getData(key: string): any {
    return this.store[key];
  }

  subscribe(key: string, callback: Function) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
    };
  }

  // Specific helpers for common data types
  getYieldData() { return this.getData('yieldData'); }
  setYieldData(data: any) { this.setData('yieldData', data); }

  getClimateData() { return this.getData('climateData'); }
  setClimateData(data: any) { this.setData('climateData', data); }

  getTreatmentMeans() { return this.getData('treatmentMeans'); }
  setTreatmentMeans(data: any) { this.setData('treatmentMeans', data); }
}

export const dataBridge = new DataBridge();
