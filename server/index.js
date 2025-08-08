require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Подключение к PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Пример API эндпоинта
app.get('/api/user', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [1]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Обслуживание фронтенда
app.use(express.static('../client'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Эмуляция платежной системы
app.post('/api/payment/deposit', (req, res) => {
  const { amount, userId } = req.body;
  
  // В реальности: проверка транзакции в блокчейне
  // Для MVP просто увеличиваем баланс
  pool.query(
    'UPDATE users SET balance = balance + $1 WHERE id = $2',
    [amount, userId],
    (err) => {
      if(err) return res.status(500).send('Database error');
      
      // Эмуляция успешного платежа
      res.json({
        success: true,
        newBalance: balance + amount
      });
    }
  );
});

const TronWeb = require('tronweb');

const tronWeb = new TronWeb({
  fullHost: 'https://api.trongrid.io',
  privateKey: process.env.TRON_PRIVATE_KEY
});

app.post('/api/payment/verify', async (req, res) => {
  const { txHash, userId, amount } = req.body;
  
  try {
    const tx = await tronWeb.trx.getTransaction(txHash);
    
    // Проверка: 
    // - Адрес получателя (ваш кошелек)
    // - Сумма
    // - Статус транзакции
    if(tx.to !== process.env.WALLET_ADDRESS) throw new Error('Invalid recipient');
    if(tx.amount < amount) throw new Error('Insufficient amount');
    if(!tx.ret[0].contractRet === 'SUCCESS') throw new Error('Transaction failed');
    
    // Обновление баланса в БД
    pool.query('UPDATE users SET balance = balance + $1 WHERE id = $2', 
      [amount, userId]);
    
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
