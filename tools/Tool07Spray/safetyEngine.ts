
import { SafetyCard } from './sprayerTypes';

export function getSafetyCard(formulation: string): SafetyCard {
  // Static advisory logic based on formulation type
  let ppe = ["Gloves", "Mask", "Face Shield", "Long Sleeves"];
  let reEntry = "24 Hours";
  let storage = "Cool, dry, locked place away from food.";
  let toxicity = "Follow label classification (Red/Yellow/Blue/Green triangle).";

  if (formulation === 'EC' || formulation === 'SC') {
    ppe.push("Chemical-resistant boots");
    reEntry = "48 Hours (High Vapor)";
  } else if (formulation === 'GR' || formulation === 'WP') {
    ppe.push("Dust mask (N95)");
    reEntry = "12 Hours (Low Vapor)";
  }

  return {
    ppe,
    reEntryInterval: reEntry,
    storage,
    toxicity
  };
}
