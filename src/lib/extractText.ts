import * as pdfjsLib from 'pdfjs-dist'
import JSZip from 'jszip'

// Configurar el worker de PDF.js (necesario para Vite)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()

export async function extraerTextoDePDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  
  // 🔥 El 'as any' quita el error de TypeScript y permite compilar en Vercel
  const pdf = await (pdfjsLib as any).getDocument(arrayBuffer).promise
  let texto = ''
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    
    // 🔥 Aquí también usamos 'as any' para que no se queje del item.str
    const strings = content.items.map((item: any) => (item as any).str)
    texto += strings.join(' ') + '\n'
  }
  return texto
}

export async function extraerTextoDePPTX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(arrayBuffer)
  let texto = ''

  // Buscamos los archivos XML de las diapositivas dentro del PPTX
  const slideFiles = Object.keys(zip.files).filter(name => 
    name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
  )

  for (const slideName of slideFiles) {
    const xmlContent = await zip.files[slideName].async('string')
    // Limpiamos las etiquetas XML para quedarnos solo con el texto
    const textMatches = xmlContent.match(/<a:t>(.*?)<\/a:t>/g) || []
    const slideText = textMatches.map(t => t.replace(/<\/?a:t>/g, '')).join(' ')
    texto += slideText + '\n'
  }

  return texto
}