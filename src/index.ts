import express from 'express'
const data = require("../objects.json")
const app = express()
const port = 8080
import { BoundingBox, pick_random, shuffle } from './utils'

app.use(express.json())
app.set('view engine', 'pug')
app.use("/public", express.static('public'));

// tracking options between user answers (images with more than one right answer)
var boxes: BoundingBox[] = [];
var buttons_pressed: string[] = [];
var right_answer_names: string[];
var box_index: number = 0;

app.get('/', (req: express.Request, res: express.Response) => {
  box_index = 0;
  boxes = [];
  // right answer
  const image = pick_random(data)[0];
  right_answer_names = Array.from(
    new Set(image.bounding_boxes.map(x => x.translation))
  );
  // wrong answer
  var wrong_answer_number = Math.round(right_answer_names.length * 2.5);
  wrong_answer_number = wrong_answer_number > 6 ? 6 : wrong_answer_number < 4 ? 4 : wrong_answer_number;
  const wrong_choices = pick_random(
    data,
    wrong_answer_number,
    right_answer_names
  );
  const wrong_names = Array.from(
    new Set(wrong_choices.flatMap(x => x.bounding_boxes).map(y => y.translation))
  ).slice(0, wrong_answer_number);
  // combine the two
  const names_all_images = shuffle(right_answer_names.concat(wrong_names));
  right_answer_names.forEach(right_name => {
    boxes.push(image.bounding_boxes.filter(x => x.translation == right_name).sort((a, b) => b.score - a.score)[0]);
  });
  res.render('index', {
    url: image.url,
    names: names_all_images,
    box: boxes.map(x => x.box)[box_index],
  });
});

app.post('/answer', (req, res) => {
  const button_pressed = req.body.text;
  const is_in_image = right_answer_names[box_index] == button_pressed;
  if (is_in_image == true) {
    buttons_pressed.push(button_pressed);
    if (buttons_pressed.length == right_answer_names.length) {
      buttons_pressed = [];
      res.send({ all_answers: true, in_image: is_in_image });
      return;
    }
    box_index += 1;
  }
  res.send({ all_answers: false, in_image: is_in_image, new_box: boxes.map(x => x.box)[box_index] });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
