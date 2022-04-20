import { DateTime } from 'https://esm.run/luxon'

export default function supermemo(item, grade){
  let nextInterval
  let nextRepetition
  let nextEfactor

  if (grade >= 3) {
    if (item.repetition === 0) {
      nextInterval = 1;
      nextRepetition = 1;
    } else if (item.repetition === 1) {
      nextInterval = 6;
      nextRepetition = 2;
    } else {
      nextInterval = Math.round(item.interval * item.efactor);
      nextRepetition = item.repetition + 1;
    }
  } else {
    nextInterval = 1;
    nextRepetition = 0;
  }

  nextEfactor =
    item.efactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));

  if (nextEfactor < 1.3) nextEfactor = 1.3;

  try{
  item.interval = nextInterval
  item.repetition = nextRepetition
  item.efactor = nextEfactor
  item.dueDate = DateTime.utc().plus({ days: 1}).toISO()
  delete item.grade
  }catch(e){
    console.log("Dayjs error", e)
  }
}
