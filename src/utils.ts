export interface BoundingBox {
  box: number[]
  dissimilar_ids: number[]
  in_summary: boolean
  name: string
  score: number
  systents_same: boolean
  translation: string
}
interface TranslateResults {
  obj: string
  translate: string
  translate_cleaned: string
}
interface ImageClassifyResults {
  objects: string[]
  summary: string
}
export interface LangImage {
  url: string
  unplash_desc: string
  results: ImageClassifyResults[]
  bounding_boxes: BoundingBox[]
  gl_summary_translation_it: string
  gl_translation_it: TranslateResults[]
}
const fetch_image_by_id = (choices: LangImage[], id: number): BoundingBox => {
  const split_id = id.toString().split('.')
  const id_image = Number(split_id[0])
  const id_bbox = Number(split_id[1] ?? 0)
  return choices[id_image]['bounding_boxes'][id_bbox]
}
export const fetch_wrong_answer_names = (
  data: LangImage[],
  right_answer: BoundingBox,
  no_answers: number = 4
): string[] => {
  const wrong_names: string[] = []
  for (let i = 0; i < no_answers; i++) {
    wrong_names.push(
      fetch_image_by_id(
        data,
        right_answer.dissimilar_ids[
          Math.floor(Math.random() * right_answer.dissimilar_ids.length)
        ]
      ).translation
    )
  }
  return wrong_names
}
// fisher-yates
export const shuffle = (array: string[]): string[] => {
  let currentIndex = array.length
  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--
    // And swap it with the current element.
    ;[array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex]
    ]
  }
  return array
}
