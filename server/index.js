//middleware
const {
    client, 
    createTable,
    createFavorites,
    createProducts,
    fetchFavorites,
    fetchUsers,
    fetchProducts 
  } = require('./db');
  const express = require('express');
  const app = express();
  app.use(express.json());

// GET /api/users - returns array of users
app.get('/api/users', async(req, res, next)=> {
    try{
        res.send(await fetchUsers());
    } catch(ex){
        next(ex)
    }
});
// GET /api/products - returns an array of products
app.get('/api/products', async(req, res, next) => {
    try{
        res.send(await fetchProducts());
    } catch(ex) {
        next(ex);
    }
});
// GET /api/users/:id/favorites - returns an array of favorites for a user
app.get('/api/users/:id/favorites', async(req, res, next) => {
    try{
        res.send(await fetchFavorites());
    } catch(ex) {
        next(ex);
    }
});
// POST /api/users/:id/favorites - payload: a product_id
app.post('/api/users/:id/favorites', async())
// returns the created favorite with a status code of 201
// DELETE /api/users/:userId/favorites/:id - deletes a favorite for a user, returns nothing with a status code of 204