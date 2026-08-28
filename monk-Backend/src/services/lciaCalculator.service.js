/**
 * LCIA Emission & Environmental Impact Calculator Service
 * Calculates GWP (Global Warming Potential kg CO2e), Water Footprint (m3),
 * and PPWR Recyclability Grades based on IPCC / DEFRA factors.
 */

const MATERIAL_FACTORS = {
  steel: 2.4,
  stainless_steel: 2.7,
  aluminum: 8.2,
  copper: 3.8,
  plastic: 2.1,
  pet: 2.15,
  hdpe: 1.9,
  pp: 1.95,
  cardboard: 0.9,
  paper: 0.85,
  glass: 1.1,
  textile: 4.5,
  cotton: 5.2,
  wood: 0.35,
  default: 2.0
};

const ELECTRICITY_FACTORS = {
  GRID_MIX: 0.82,       // India Grid Average (kg CO2e / kWh)
  SOLAR_ON_SITE: 0.04,  // Solar PV Lifecycle
  WIND_PPA: 0.02,       // Wind Farm Lifecycle
  HYDRO: 0.03,
  COAL_THERMAL: 0.98,
  default: 0.75
};

const FUEL_FACTORS = {
  naturalGasM3: 2.0,    // kg CO2e / m3
  dieselLiters: 2.68    // kg CO2e / liter
};

const TRANSPORT_FACTORS = {
  TRUCK_DIESEL: 0.105,    // kg CO2e / tonne-km
  CONTAINER_SHIP: 0.018,  // kg CO2e / tonne-km
  AIR_FREIGHT: 1.12,      // kg CO2e / tonne-km
  RAIL: 0.035,            // kg CO2e / tonne-km
  default: 0.09
};

const PACKAGING_FACTORS = {
  CARDBOARD_BOX: 0.95,
  PLASTIC_FILM: 2.3,
  WOODEN_PALLET: 0.35,
  BUBBLE_WRAP: 2.5,
  default: 1.2
};

const WASTE_FACTORS = {
  RECYCLING: 0.1,
  LANDFILL: 0.85,
  INCINERATION_WITH_ENERGY_RECOVERY: 0.45,
  HAZARDOUS_DISPOSAL: 1.4,
  default: 0.5
};

function resolveMaterialFactor(name = '') {
  const clean = name.toLowerCase().replace(/[\s-]/g, '_');
  for (const key of Object.keys(MATERIAL_FACTORS)) {
    if (clean.includes(key)) return MATERIAL_FACTORS[key];
  }
  return MATERIAL_FACTORS.default;
}

exports.calculateLciaImpacts = (projectData) => {
  let rawMaterialsGwp = 0;
  if (Array.isArray(projectData.materials)) {
    for (const mat of projectData.materials) {
      let qtyKg = Number(mat.quantity) || 0;
      if (mat.unit === 'g') qtyKg /= 1000;
      if (mat.unit === 'tonne') qtyKg *= 1000;

      const baseFactor = resolveMaterialFactor(mat.materialName);
      const recycledDiscount = Math.min(100, Math.max(0, Number(mat.recycledContentPct) || 0)) * 0.005; // Up to 50% discount for 100% recycled
      const effectiveFactor = baseFactor * (1 - recycledDiscount);

      rawMaterialsGwp += qtyKg * effectiveFactor;
    }
  }

  let manufacturingGwp = 0;
  const mfg = projectData.manufacturing || {};
  const elekKwh = Number(mfg.electricityKwh) || 0;
  const elekSrc = mfg.electricitySource || 'GRID_MIX';
  const elekFactor = ELECTRICITY_FACTORS[elekSrc] || ELECTRICITY_FACTORS.default;
  manufacturingGwp += elekKwh * elekFactor;

  const gasM3 = Number(mfg.naturalGasM3) || 0;
  manufacturingGwp += gasM3 * FUEL_FACTORS.naturalGasM3;

  const dieselL = Number(mfg.dieselLiters) || 0;
  manufacturingGwp += dieselL * FUEL_FACTORS.dieselLiters;

  let logisticsGwp = 0;
  if (Array.isArray(projectData.transportation)) {
    for (const leg of projectData.transportation) {
      const distKm = Number(leg.distanceKm) || 0;
      const weightTons = Number(leg.weightTons) || 1;
      const modeFactor = TRANSPORT_FACTORS[leg.mode] || TRANSPORT_FACTORS.default;
      logisticsGwp += distKm * weightTons * modeFactor;
    }
  }

  let packagingGwp = 0;
  let avgRecycledPkgPct = 0;
  let totalPkgWeightKg = 0;
  if (Array.isArray(projectData.packaging)) {
    for (const pkg of projectData.packaging) {
      const weightKg = (Number(pkg.weightGramsPerUnit) || 0) / 1000;
      const pkgFactor = PACKAGING_FACTORS[pkg.packagingType] || PACKAGING_FACTORS.default;
      packagingGwp += weightKg * pkgFactor;

      totalPkgWeightKg += weightKg;
      avgRecycledPkgPct += (Number(pkg.recycledContentPct) || 0) * weightKg;
    }
  }
  const weightedRecycledPct = totalPkgWeightKg > 0 ? (avgRecycledPkgPct / totalPkgWeightKg) : 0;

  let wasteGwp = 0;
  if (Array.isArray(projectData.wasteEmissions)) {
    for (const item of projectData.wasteEmissions) {
      const qtyKg = Number(item.quantityKg) || 0;
      const methodFactor = WASTE_FACTORS[item.treatmentMethod] || WASTE_FACTORS.default;
      wasteGwp += qtyKg * methodFactor;
      if (item.directCo2eKg) {
        wasteGwp += Number(item.directCo2eKg) || 0;
      }
    }
  }

  // Water footprint in m3
  const waterConsumption = Number(mfg.waterConsumptionLiters) || 0;
  const wastewater = Number(mfg.processWastewaterLiters) || 0;
  const waterFootprintM3 = Math.round(((waterConsumption + wastewater) / 1000) * 100) / 100;

  // PPWR Grade calculation
  let ppwrRecyclabilityGrade = 'GRADE_B';
  if (weightedRecycledPct >= 70) ppwrRecyclabilityGrade = 'GRADE_A';
  else if (weightedRecycledPct >= 40) ppwrRecyclabilityGrade = 'GRADE_B';
  else if (weightedRecycledPct >= 15) ppwrRecyclabilityGrade = 'GRADE_C';
  else ppwrRecyclabilityGrade = 'GRADE_D';

  const totalGwp = Math.round((rawMaterialsGwp + manufacturingGwp + logisticsGwp + packagingGwp + wasteGwp) * 100) / 100;

  return {
    totalGwpKgCo2e: Math.max(0, totalGwp),
    gwpByStage: {
      rawMaterials: Math.round(rawMaterialsGwp * 100) / 100,
      manufacturing: Math.round(manufacturingGwp * 100) / 100,
      logistics: Math.round(logisticsGwp * 100) / 100,
      packaging: Math.round(packagingGwp * 100) / 100,
      waste: Math.round(wasteGwp * 100) / 100
    },
    waterFootprintM3,
    ppwrRecyclabilityGrade,
    calculatedAt: new Date()
  };
};
