import express from 'express'
import cors from 'cors'
import faker from 'faker'

const PORT = process.env.PORT || 5000

const salt = 'salt'

export const users = [
  {
    username: 'user_good',
    password: 'cGFzc3dvcmRfZ29vZA==',
  },
  {
    username: 'user_bad',
    password: 'cGFzc3dvcmRfYmFk',
  },
]

const app = express()

app.use(
  cors({
    origin: '*',
  }),
)

const tokenTtl = 3600000

const crypt = (salt, text) => {
  const textToChars = (text) => text.split('').map((c) => c.charCodeAt(0))
  const byteHex = (n) => ('0' + Number(n).toString(16)).substr(-2)
  const applySaltToChar = (code) =>
    textToChars(salt).reduce((a, b) => a ^ b, code)

  return text
    .split('')
    .map(textToChars)
    .map(applySaltToChar)
    .map(byteHex)
    .join('')
}

const decrypt = (salt, encoded) => {
  const textToChars = (text) => text.split('').map((c) => c.charCodeAt(0))
  const applySaltToChar = (code) =>
    textToChars(salt).reduce((a, b) => a ^ b, code)
  return encoded
    .match(/.{1,2}/g)
    .map((hex) => parseInt(hex, 16))
    .map(applySaltToChar)
    .map((charCode) => String.fromCharCode(charCode))
    .join('')
}

const getToken = () => {
  const timestamp = Date.now().toString()
  return crypt(salt, timestamp)
}

const getTimestamp = (token) => {
  return decrypt(salt, token)
}

const validateToken = (token) => {
  const timestamp = getTimestamp(token)

  const elapsed = Date.now() - Number(timestamp)

  if (elapsed < tokenTtl) {
    return getToken()
  }
}

export const authenticate = (request) => {
  const { username, password, token } = request.query

  if (token) {
    return validateToken(token)
  }

  const candidate = users.find((user) => username === user.username)

  if (candidate && candidate.password === password) {
    return getToken()
  }
}

app.get('/auth', (req, res) => {
  const authenticated = authenticate(req)
  if (!authenticated) {
    res.status(500).send('Unauthorized')
  } else {
    res.status(200).send(authenticated)
  }
})

app.get('/', (req, res) => {
  if (!authenticate(req)) {
    res.status(500).send('Unauthorized')
  }
  const query = req.query

  let responseLength = Math.floor(Math.random() * 10)

  let responseData = []

  const good = query.username === goodUser.username

  const compromises = good ? 0 : Math.ceil(Math.random() * 3)

  const frauds = good ? 0 : Math.floor(Math.random() * 3)

  const Account = faker.finance.account(16)

  const addRecentTransactionWithStatus = (status) => {
    responseData.push({
      Amount: Math.floor(Math.random() * 1000),
      ConfirmationNumber: faker.datatype.uuid(),
      Id: faker.datatype.uuid(),
      Status: status,
      Memo: faker.finance.transactionDescription(),
      Recipient: faker.finance.account(16),
      TransactionType: faker.finance.transactionType(),
      Account,
      Date: faker.date.recent(7),
    })
  }
  for (let i = compromises; i > 0; i--) {
    addRecentTransactionWithStatus('COMPROMISED')
  }
  for (let i = frauds; i > 0; i--) {
    addRecentTransactionWithStatus('FRAUD')
  }
  for (let i = responseLength - (frauds + compromises); i > 0; i--) {
    addRecentTransactionWithStatus('VERIFIED')
  }

  responseData.sort((a, b) => new Date(b.Date) - new Date(a.Date))

  res.setHeader('Content', 'application/json')
  res.status(200).send(responseData)
})
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})
