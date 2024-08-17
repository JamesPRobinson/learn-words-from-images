export interface Object {
  box: number[]
  in_summary: boolean
  manual: boolean
  name: string
  score: number
  systents_same: boolean
  translate: string
}
interface NotInImage {
  name: string
  translate: string
}
interface Credit {
  photographer_username: string
  photographer_first_name: string
  photographer_last_name: string
}
export interface LangImage {
  credit: Credit
  url: string
  unplash_desc: string
  objects: Object[]
  summary: string
  summary_translation: string
  not_in_image: NotInImage[]
}

export const fetch_wrong_answer_names = (
  data: LangImage,
  no_answers: number = 4
): string[] => {
  const wrong_names: string[] = []
  while (wrong_names.length < no_answers) {
    var wrong_name =
      data.not_in_image[Math.floor(Math.random() * data.not_in_image.length)]
        .translate
    if (!wrong_names.includes(wrong_name)) {
      wrong_names.push(wrong_name)
    }
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
