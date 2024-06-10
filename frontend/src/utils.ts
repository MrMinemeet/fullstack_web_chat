import axios from 'axios'

import { API_URL, UNKNOWN_USERNAME } from '@/constants'

export function getToken(): string | undefined {
  return document.cookie
    .split(';')
    .find((c) => c.startsWith('token='))
    ?.split('=')[1]
}

export function getUsername(): string {
  const token = getToken()
  if (!token) return UNKNOWN_USERNAME
  try {
    return JSON.parse(atob(token.split('.')[1])).username
  } catch (e) {
    return UNKNOWN_USERNAME
  }
}

/**
 * Uploads a file to the server
 * @param file The file to upload
 * @returns The ID of the uploaded file
 * @throws If the file could not be uploaded
 */
export async function uploadFile(file: File): Promise<number> {
  return new Promise(async (resolve, reject) => {
    const fileBuffer = await file.arrayBuffer()
    let response = null
    try {
      response = await axios.put(`http://${API_URL}/file/upload`, fileBuffer, {
        params: {
          name: encodeURIComponent(file.name)
        },
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/octet-stream'
        }
      })
    } catch (e: any) {
      return reject(`Failed to upload file: ${e}`)
    }

    if (response.status !== 201)
      return reject(`Failed to upload file: ${response.status} ${response.statusText}`)

    console.log(`File uploaded and received ID ${response.data.fileId}`)
    resolve(response.data.fileId)
  })
}

/**
 * Downloads a file from the server. The file is stored by the browser.
 * @param fileId The ID of the file to download
 * @returns Nothing
 */
export async function downloadFile(fileId: number): Promise<void> {
  return new Promise(async (resolve, reject) => {
    let response = null
    try {
      response = await axios.get(`http://${API_URL}/file/download/`, {
        params: {
          fileId: fileId
        },
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      })
    } catch (e: any) {
      if (!e.message.includes('410')) {
        return reject(`Failed to download file: ${e}`)
      }
      return reject(`File with ID ${fileId} has been deleted and is no longer available.`)
    }

    if (response.status !== 200)
      return reject(`Failed to download file: ${response.status} ${response.statusText}`)

    // Store blob to file
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url

    // Set the filename
    const filename = response.headers['content-disposition'].split('filename=')[1]
    link.setAttribute('download', filename)
    document.body.appendChild(link)

    // Trigger download
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    resolve()
  })
}

/**
 * Deletes a file from the server
 * @param fileId The ID of the file to delete
 * @returns Nothing
 */
export async function deleteFile(fileId: number): Promise<void> {
  return new Promise(async (resolve, reject) => {
    let response = null
    try {
      response = await axios.delete(`http://${API_URL}/file/remove`, {
        params: {
          fileId: fileId
        },
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      })
    } catch (e: any) {
      return reject(`Failed to delete file: ${e.data?.message || e?.statusText || e}`)
    }
    
    resolve()
  })
}