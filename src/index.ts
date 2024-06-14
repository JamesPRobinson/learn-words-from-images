require('dotenv').config()
import express from 'express'
var session = require('express-session')

const data = require('../objects.json')
const app = express()
const port = 8080
import { BoundingBox, pick_random, shuffle } from './utils'

declare module 'express-session' {
  export interface SessionData {
    data: {
      box_index: number
      boxes: BoundingBox[]
      buttons_pressed: string[]
      right_answer_names: string[]
    }
  }
}

app.use(express.json());
app.set('view engine', 'pug')
app.use('/public', express.static('public'))

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { sameSite: 'strict' },
  })
)

/*
app.use(function (req, res, next) {
  if (!req.session.data) {
    req.session.data = {
      box_index: 0,
      boxes: [],
      buttons_pressed: [],
      right_answer_names: []
    }
  }
  next()
})
*/
app.get('/', (req: express.Request, res: express.Response) => {
  // tracking options between user answers (images with more than one right answer)
  req.session.data = {
    box_index: 0,
    boxes: [],
    buttons_pressed: [],
    right_answer_names: []
  }
  // right answer
  const image = pick_random(data)[0]
  req.session.data.right_answer_names = Array.from(
    new Set(image.bounding_boxes.map(x => x.translation))
  )
  // wrong answer
  var wrong_answer_number = Math.round(
    req.session.data.right_answer_names.length * 2.5
  )
  wrong_answer_number =
    wrong_answer_number > 6
      ? 6
      : wrong_answer_number < 4
      ? 4
      : wrong_answer_number
  const wrong_choices = pick_random(
    data,
    wrong_answer_number,
    req.session.data.right_answer_names
  )
  const wrong_names = Array.from(
    new Set(
      wrong_choices.flatMap(x => x.bounding_boxes).map(y => y.translation)
    )
  ).slice(0, wrong_answer_number)
  // combine the two
  const names_all_images = shuffle(
    req.session.data.right_answer_names.concat(wrong_names)
  )
  const boxes: BoundingBox[] = []
  req.session.data.right_answer_names.forEach(right_name => {
    boxes.push(
      image.bounding_boxes
        .filter(x => x.translation == right_name)
        .sort((a, b) => b.score - a.score)[0]
    )
  })
  req.session.data.boxes = boxes
  res.render('index', {
    url: image.url,
    names: names_all_images,
    box: req.session.data.boxes.map(x => x.box)[req.session.data.box_index]
  })
})

app.post('/answer', (req, res) => {
  const button_pressed = req.body.text
  const is_in_image =
    req?.session?.data?.right_answer_names[req.session.data.box_index] ==
    button_pressed
  if (is_in_image == true) {
    req?.session?.data?.buttons_pressed.push(button_pressed)
    if (
      req?.session?.data?.buttons_pressed.length ==
      req?.session?.data?.right_answer_names.length
    ) {
      if (req?.session?.data?.buttons_pressed != undefined) {
        req.session.data.buttons_pressed = []
      }
      res.send({ all_answers: true, in_image: is_in_image })
      return
    }
    if (req?.session?.data?.box_index != undefined) {
      req.session.data.box_index += 1
    }
  }
  res.send({
    all_answers: false,
    in_image: is_in_image,
    new_box: req?.session?.data?.boxes.map(x => x.box)[
      req?.session?.data?.box_index
    ]
  })
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
