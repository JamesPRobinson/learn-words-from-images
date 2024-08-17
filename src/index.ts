require('dotenv').config()
import express from 'express'
const { expressCspHeader, INLINE, NONE, SELF } = require('express-csp-header')
var session = require('express-session')
const data = require(process.env.OBJECT_PATH?.toString() ??
  '../example_objects.json')
const app = express()
const port = 8080
import { LangImage, Object, fetch_wrong_answer_names, shuffle } from './utils'
type Nullable<T> = T | null
declare module 'express-session' {
  export interface SessionData {
    data: {
      object: Nullable<Object>
      image: Nullable<LangImage>
    }
  }
}
app.use(express.json())
app.use(
  expressCspHeader({
    directives: {
      'default-src': [SELF],
      'script-src': [SELF, INLINE],
      'style-src': [SELF, INLINE],
      'img-src': ['https://images.unsplash.com/', SELF],
      'worker-src': [NONE]
    }
  })
)
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
  const object = image.objects[Math.floor(Math.random() * image.objects.length)]
  req.session.data = {
    object: object,
    image: image
  }
  // get wrong answers
  const wrong_names = fetch_wrong_answer_names(image)
  // combine the two
  const names_all_images = shuffle(
    [req.session.data?.object?.translate ?? ''].concat(wrong_names)
  )
  res.render('index', {
    url: image.url,
    names: names_all_images,
    box: object.box,
    artist_name: `${image.credit.photographer_first_name} ${image.credit.photographer_last_name}`,
    artist_link: `https://unsplash.com/@${image.credit.photographer_username}`
  })
})
app.post('/answer', (req, res) => {
  // answer as chosen by user
  const button_pressed = req.body.text
  // index that is tracking possible choices: does it's value match the text chosen by user?
  const is_in_image = req?.session?.data?.object?.translate == button_pressed
  res.send({ in_image: is_in_image })
})
app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
