import express from 'express'
import faker from 'faker'
const PORT = process.env.PORT || 3000
const goodUser = {
  username: 'user_good',
  password: 'password_good',
}
const badUser = {
  username: 'user_bad',
  password: 'password_bad',
}

const validUsernames = [goodUser.username, badUser.username]

const app = express()

app.get('/', (req, res) => {
  const query = req.body

  if (!validUsernames.includes(query.username)) {
    res.status(400).send('Invalid username')
  }

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

  res.status(200).send(responseData)
})
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})
