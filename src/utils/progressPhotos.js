/**
 * Progress photos. Data in Supabase.
 */

import * as progressPhotosService from './progressPhotosService'

/**
 * @returns {Promise<Array>}
 */
export async function getProgressPhotos() {
  return progressPhotosService.getProgressPhotos()
}

export const fileToResizedDataUrl = progressPhotosService.fileToResizedDataUrl

export async function addProgressPhoto(dataUrl, dateIso) {
  return progressPhotosService.addProgressPhoto(dataUrl, dateIso)
}

export async function deleteProgressPhoto(id) {
  return progressPhotosService.deleteProgressPhoto(id)
}
