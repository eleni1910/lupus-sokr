/**
 * Lupus Flare Risk Prediction Algorithm
 * Based on clinical parameters and lab values
 */

// Risk scoring thresholds
const RISK_THRESHOLDS = {
  LOW: { min: 0, max: 33 },
  MODERATE: { min: 34, max: 66 },
  HIGH: { min: 67, max: 100 }
};

/**
 * Calculate SLEDAI (Systemic Lupus Erythematosus Disease Activity Index)
 * Scores range from 0-105, higher indicates more active disease
 */
function calculateSLEDAI(labValues) {
  let sledaiScore = 0;

  // Seizures (8 points)
  if (labValues.seizures) sledaiScore += 8;

  // Psychosis (8 points)
  if (labValues.psychosis) sledaiScore += 8;

  // Organic brain syndrome (8 points)
  if (labValues.organicBrainSyndrome) sledaiScore += 8;

  // Visual disturbance (8 points)
  if (labValues.visualDisturbance) sledaiScore += 8;

  // Cranial nerve disorder (4 points)
  if (labValues.cranialNerveDisorder) sledaiScore += 4;

  // Lupus headache (4 points)
  if (labValues.lupusHeadache) sledaiScore += 4;

  // CVA (cerebrovascular accident) (8 points)
  if (labValues.cva) sledaiScore += 8;

  // Vasculitis (8 points)
  if (labValues.vasculitis) sledaiScore += 8;

  // Arthritis (4 points)
  if (labValues.arthritis) sledaiScore += 4;

  // Myositis (2 points)
  if (labValues.myositis) sledaiScore += 2;

  // Urinary casts (4 points)
  if (labValues.urinaryCasts) sledaiScore += 4;

  // Proteinuria (4 points if >0.5g/day)
  if (labValues.proteinuria > 0.5) sledaiScore += 4;

  // Pyuria (2 points)
  if (labValues.pyuria) sledaiScore += 2;

  // Rash (2 points)
  if (labValues.rash) sledaiScore += 2;

  // Alopecia (2 points)
  if (labValues.alopecia) sledaiScore += 2;

  // Oral ulcers (2 points)
  if (labValues.oralUlcers) sledaiScore += 2;

  // Discoid rash (4 points)
  if (labValues.discoidRash) sledaiScore += 4;

  // Nasal ulcers (2 points)
  if (labValues.nasalUlcers) sledaiScore += 2;

  // Pleuritis (4 points)
  if (labValues.pleuritis) sledaiScore += 4;

  // Pericarditis (4 points)
  if (labValues.pericarditis) sledaiScore += 4;

  // Decreased complement (C3/C4) (4 points)
  if (labValues.c3 < 80 || labValues.c4 < 16) sledaiScore += 4;

  // Increased DNA binding (2 points)
  if (labValues.dsDnaPositive) sledaiScore += 2;

  // Fever (1 point if >38°C)
  if (labValues.temperature > 38) sledaiScore += 1;

  // Thrombocytopenia (4 points if <100k)
  if (labValues.plateletCount < 100) sledaiScore += 4;

  // Leukopenia (4 points if <3k)
  if (labValues.wbcCount < 3) sledaiScore += 4;

  return sledaiScore;
}

/**
 * Calculate flare risk based on multiple factors
 * Returns risk score (0-100) and risk category (LOW, MODERATE, HIGH)
 */
function calculateFlareRisk(patientData) {
  let riskScore = 0;
  const riskFactors = [];

  const {
    sledai = 0,
    labValues = {},
    previousFlares = 0,
    medicationCompliance = 100,
    daysWithoutFollowUp = 0,
    stressLevel = 5
  } = patientData;

  // 1. SLEDAI contribution (30% of risk)
  const sledaiRisk = (sledai / 105) * 30;
  riskScore += sledaiRisk;
  if (sledaiRisk > 10) riskFactors.push('High disease activity (SLEDAI)');

  // 2. Complement levels (20% of risk)
  const c3 = labValues.c3 || 100;
  const c4 = labValues.c4 || 20;
  const lowComplementRisk = ((80 - Math.max(c3, 80)) / 80 + (16 - Math.max(c4, 16)) / 16) * 10;
  riskScore += lowComplementRisk;
  if (lowComplementRisk > 5) riskFactors.push('Low complement levels (C3/C4)');

  // 3. Anti-dsDNA antibody (15% of risk)
  const dsDnaLevel = labValues.dsDnaLevel || 0;
  const dsDnaRisk = Math.min((dsDnaLevel / 200) * 15, 15);
  riskScore += dsDnaRisk;
  if (dsDnaRisk > 7) riskFactors.push('Elevated anti-dsDNA antibodies');

  // 4. Proteinuria (15% of risk)
  const proteinuria = labValues.proteinuria || 0;
  const proteinuriaRisk = Math.min((proteinuria / 3.5) * 15, 15);
  riskScore += proteinuriaRisk;
  if (proteinuriaRisk > 7) riskFactors.push('Significant proteinuria');

  // 5. Medication compliance (10% of risk)
  const complianceRisk = (100 - medicationCompliance) / 10;
  riskScore += complianceRisk;
  if (medicationCompliance < 80) riskFactors.push('Low medication compliance');

  // 6. Follow-up adherence (5% of risk)
  const followUpRisk = Math.min((daysWithoutFollowUp / 180) * 5, 5);
  riskScore += followUpRisk;
  if (daysWithoutFollowUp > 90) riskFactors.push('Overdue for follow-up visit');

  // 7. Previous flare history (5% of risk)
  const flareHistoryRisk = Math.min((previousFlares / 5) * 5, 5);
  riskScore += flareHistoryRisk;
  if (previousFlares > 2) riskFactors.push('Multiple previous flares');

  // 8. Stress level (Psychosocial factor)
  const stressRisk = (stressLevel / 10) * 5;
  riskScore += stressRisk;
  if (stressLevel > 7) riskFactors.push('High stress levels reported');

  // Cap risk score at 100
  riskScore = Math.min(riskScore, 100);

  // Determine risk category
  let riskCategory = 'LOW';
  if (riskScore >= RISK_THRESHOLDS.HIGH.min) {
    riskCategory = 'HIGH';
  } else if (riskScore >= RISK_THRESHOLDS.MODERATE.min) {
    riskCategory = 'MODERATE';
  }

  return {
    riskScore: Math.round(riskScore),
    riskCategory,
    riskFactors,
    timestamp: new Date().toISOString()
  };
}

/**
 * Generate alert recommendations based on risk level
 */
function generateAlertRecommendations(riskAssessment) {
  const { riskCategory, riskScore } = riskAssessment;
  const recommendations = [];

  if (riskCategory === 'HIGH') {
    recommendations.push('⚠️ URGENT: Patient requires immediate clinical evaluation');
    recommendations.push('Consider increasing medication intensity or frequency');
    recommendations.push('Schedule urgent follow-up appointment within 1 week');
    recommendations.push('Order comprehensive lab panel (CBC, CMP, complement levels)');
    recommendations.push('Consider rheumatology specialist consultation');
  } else if (riskCategory === 'MODERATE') {
    recommendations.push('⚠️ Patient requires closer monitoring');
    recommendations.push('Schedule follow-up appointment within 2-4 weeks');
    recommendations.push('Review medication compliance and side effects');
    recommendations.push('Order repeat lab work within 2 weeks');
    recommendations.push('Provide patient education on flare warning signs');
  } else {
    recommendations.push('✓ Patient is stable - continue current management');
    recommendations.push('Routine follow-up in 6-8 weeks');
    recommendations.push('Continue current medications as prescribed');
    recommendations.push('Monitor for any new symptoms between visits');
  }

  return recommendations;
}

/**
 * Check if patient is overdue for follow-up
 */
function checkFollowUpOverdue(lastFollowUpDate, riskCategory) {
  const days = Math.floor((new Date() - new Date(lastFollowUpDate)) / (1000 * 60 * 60 * 24));
  
  let overdueDays = 0;
  if (riskCategory === 'HIGH' && days > 7) {
    overdueDays = days - 7;
  } else if (riskCategory === 'MODERATE' && days > 28) {
    overdueDays = days - 28;
  } else if (riskCategory === 'LOW' && days > 56) {
    overdueDays = days - 56;
  }

  return {
    isOverdue: overdueDays > 0,
    overdueDays,
    lastFollowUpDays: days
  };
}

module.exports = {
  calculateSLEDAI,
  calculateFlareRisk,
  generateAlertRecommendations,
  checkFollowUpOverdue,
  RISK_THRESHOLDS
};