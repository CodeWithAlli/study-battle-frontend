import * as pdfjsLib from 'pdfjs-dist'
import JSZip from 'jszip'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()

export async function extraerPDFComoBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Quitamos el prefijo "data:application/pdf;base64," para dejar solo el string
      const base64Clean = base64.split(',')[1];
      resolve(base64Clean);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function extraerContenidoDePPTX(file: File): Promise<{ texto: string, imagenes: string[] }> {
  const arrayBuffer = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(arrayBuffer)
  let texto = ''
  const imagenes: string[] = []

  // 1. Extraer texto
  const slideFiles = Object.keys(zip.files).filter(name => 
    name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
  )

  for (const slideName of slideFiles) {
    const xmlContent = await zip.files[slideName].async('string')
    const textMatches = xmlContent.match(/<a:t>(.*?)<\/a:t>/g) || []
    const slideText = textMatches.map(t => t.replace(/<\/?a:t>/g, '')).join(' ')
    texto += slideText + '\n'
  }

  // 2. Extraer imágenes (buscamos en TODAS las carpetas de media)
  const mediaFiles = Object.keys(zip.files).filter(name => 
    name.includes('media/') && /\.(jpg|jpeg|png|gif)$/i.test(name)
  )

  console.log("Archivos multimedia encontrados en el ZIP:", mediaFiles.length)

  // Limitamos a 4 imágenes para no saturar
  for (const mediaName of mediaFiles.slice(0, 4)) {
    try {
      const imageBuffer = await zip.files[mediaName].async('base64')
      const ext = mediaName.split('.').pop()?.toLowerCase()
      const mimeType = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg'
      imagenes.push(`data:${mimeType};base64,${imageBuffer}`)
    } catch (e) {
      console.warn("Error leyendo imagen:", mediaName, e)
    }
  }

  return { texto, imagenes }
}