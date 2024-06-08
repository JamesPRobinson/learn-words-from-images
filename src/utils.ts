export interface BoundingBox {
  box: number[]
  in_summary: boolean
  name: string
  score: number
  systents_same: boolean
  translation: string
}
interface GoogleTranslateResults {
  obj: string
  translate: string
  translate_cleaned: string
}
interface ImageClassifyResults {
  objects: string[]
  summary: string
}
interface LangImage {
  url: string
  unplash_desc: string
  results: ImageClassifyResults[]
  bounding_boxes: BoundingBox[]
  gl_summary_translation_it: string
  gl_translation_it: GoogleTranslateResults[]
}
// simple string matching checks for a pool of unrelated answers
const is_related = (already_chosen: string[], choice: string): boolean => {
  return (
    already_chosen.filter(
      x =>
        x.toLowerCase().includes(choice.toLowerCase()) ||
        choice.toLowerCase().includes(x.toLowerCase())
    ).length > 0 || already_chosen.includes(choice.toLowerCase())
  )
}
// pick initial image, and then subsequently random wrong answers from other images
export const pick_random = (
  choices: LangImage[],
  n: number = 1,
  already_chosen: string[] = []
): LangImage[] => {
  const selected: LangImage[] = []
  var limit = 0
  const max_search = 100
  while (limit < max_search) {
    // get a random choice from list
    const index = Math.floor(Math.random() * choices.length)
    // extracts
    const random_choice = choices[index]
    // check has already been chosen if n > 0
    const names_in_choice = random_choice.bounding_boxes.flatMap(
      x => x.translation
    )
    const overlap = names_in_choice.filter(x => is_related(already_chosen, x))
    if (overlap.length === 0) {
      selected.push(random_choice)
      already_chosen.concat(names_in_choice)
    }
    limit++
    if (selected.length == n) {
      break
    }
  }
  return selected
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
