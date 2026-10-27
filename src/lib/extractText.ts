import * as pdfjsLib from 'pdfjs-dist'
import JSZip from 'jszip'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()

export async function extraerTextoDePDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await (pdfjsLib as any).getDocument(arrayBuffer).promise
  let texto = ''
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const strings = content.items.map((item: any) => (item as any).str)
    texto += strings.join(' ') + '\n'
  }
  return texto
}

// Modificamos esta función para que devuelva TEXTO e IMÁGENES
export async function extraerContenidoDePPTX(file: File): Promise<{ texto: string, imagenes: string[] }> {
  const arrayBuffer = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(arrayBuffer)
  let texto = ''
  const imagenes: string[] = []

  // 1. Extraer texto de las diapositivas
  const slideFiles = Object.keys(zip.files).filter(name => 
    name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
  )

  for (const slideName of slideFiles) {
    const xmlContent = await zip.files[slideName].async('string')
    const textMatches = xmlContent.match(/<a:t>(.*?)<\/a:t>/g) || []
    const slideText = textMatches.map(t => t.replace(/<\/?a:t>/g, '')).join(' ')
    texto += slideText + '\n'
  }

  // 2. Extraer imágenes (jpg, jpeg, png) de la carpeta media
  const mediaFiles = Object.keys(zip.files).filter(name => 
    name.startsWith('ppt/media/') && /\.(jpg|jpeg|png)$/i.test(name)
  )

  // Limitamos a 4 imágenes para no saturar el backend
  for (const mediaName of mediaFiles.slice(0, 4)) {
    const imageBuffer = await zip.files[mediaName].async('base64')
    // Detectar la extensión para el tipo MIME
    const ext = mediaName.split('.').pop()?.toLowerCase()
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg'
    imagenes.push(`data:${mimeType};base64,${imageBuffer}`)
  }

  return { texto, imagenes }
}