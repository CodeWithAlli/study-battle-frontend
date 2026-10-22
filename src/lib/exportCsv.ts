export function exportarResultados(resultados: any[]) {
  if (resultados.length === 0) return

  // Usamos punto y coma (;) porque Excel en español lo lee mejor
  const separador = ';'

  const headers = [
    'Nickname', 'Aciertos', 'Total', 'Extras', 
    'Puntaje', 'Nota Sugerida', 'Top 3', 'Veces x3'
  ]

  const rows = resultados.map(r => [
    r.nickname,
    r.aciertos,
    r.total,
    r.extras,
    r.puntaje,
    r.nota_sugerida,
    r.esTop3 ? 'Sí' : 'No',
    r.vecesX3
  ])

  // Unir con punto y coma
  const csvContent = [
    headers.join(separador),
    ...rows.map(row => row.join(separador))
  ].join('\n')

  // El \uFEFF es un BOM (Byte Order Mark) que ayuda a Excel a leer acentos
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `resultados_study_battle_${new Date().getTime()}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}