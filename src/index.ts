require('dotenv').config()
import express from 'express'
var session = require('express-session')
const data = require(process.env.FILE_PATH?.toString() ?? "../example_objects.json")
const app = express()
const port = 8080
import {
  BoundingBox,
  LangImage,
  fetch_wrong_answer_names,
  shuffle
} from './utils'
type Nullable<T> = T | null
declare module 'express-session' {
  export interface SessionData {
    data: {
      bbox: Nullable<BoundingBox>
      image: Nullable<LangImage>
    }
  }
}
app.use(express.json())
app.set('view engine', 'pug')
app.use('/public', express.static('public'))
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { sameSite: 'strict' }
  })
)
app.get('/', (req: express.Request, res: express.Response) => {
  // get right answer
  const image = data[Math.floor(Math.random() * data.length)]
  const bbox =
    image.bounding_boxes[
      Math.floor(Math.random() * image.bounding_boxes.length)
    ]
  req.session.data = {
    bbox: bbox,
    image: image
  }
  // get wrong answers
  const wrong_names = fetch_wrong_answer_names(data, bbox)
  // combine the two
  const names_all_images = shuffle(
    [req.session.data?.bbox?.translation ?? ''].concat(wrong_names)
  )
  res.render('index', {
    url: image.url,
    names: names_all_images,
    box: bbox.box
  })
})
app.post('/answer', (req, res) => {
  // answer as chosen by user
  const button_pressed = req.body.text
  // index that is tracking possible choices: does it's balue match the text chosen by user?
  const is_in_image = req?.session?.data?.bbox?.translation == button_pressed
  res.send({ in_image: is_in_image })
})
app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
