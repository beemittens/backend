require('http')
const express = require('express')
const morgan = require('morgan')
require('dotenv').config()
const cors = require('cors')

morgan.token('body', (req, res) => {

  if (req.method !== 'POST') {
    return null
  }

  return JSON.stringify(req.body)
})

const app = express()
app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const Person = require('./models/person')

app.get('/api/info', (request, response) => {

  const nowTime = new Date()
  response.send(`<div>Phonebook has info for ${persons.length} people</div>
    <p>${nowTime.toString()}</p>`)
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons.map(person => person.toJSON()))
  })
})

app.get('/api/persons/:id', (request, response, next) => {

  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person.toJSON())
      return
    }

    response.status(404).end()
  })
  .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson  =>{

      if(updatedPerson) {
        response.json(updatedPerson.toJSON())
      } else {
        response.status(404).end()
      }
  })
  .catch(error => next(error))

})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(result => {
    console.log(`added ${person.name} number ${person.number} to phonebook!`)
    response.json(person)
  })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {

  Person.findByIdAndDelete(request.params.id).then(person =>{
    response.status(204).end()
  })
  .catch(error => next(error))

})

// Virheenkäsittelyä
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if(error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})