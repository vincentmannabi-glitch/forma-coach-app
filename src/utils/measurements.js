/**
 * Measurements. Data in Supabase.
 */

import * as measurementsService from './measurementsService'

/**
 * @returns {Promise<Array>}
 */
export async function getMeasurements() {
  return measurementsService.getMeasurements()
}

export async function saveMeasurement(entry) {
  return measurementsService.saveMeasurement(entry)
}

export async function deleteMeasurement(id) {
  return measurementsService.deleteMeasurement(id)
}
