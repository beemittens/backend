const mongoose = require('mongoose')
const savePerson = process.argv.length === 5
const getPeople = process.argv.length === 3

if (!savePerson && !getPeople) {
  console.log('Check parameters')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://fullstack:${password}@cluster0-ru7qt.mongodb.net/test?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if (savePerson) {

  const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
  })

  person.save().then(result => {
    console.log(`added ${person.name} number ${person.number} to phonebook!`)
    mongoose.connection.close()
  })

} else if (getPeople) {

  Person
    .find({})
    .then(persons => {
      console.log('phonebook:')

      persons.forEach(person => {
        console.log(`${person.name} ${person.number}`)
      })

      mongoose.connection.close()
    })
}
