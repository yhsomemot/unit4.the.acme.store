const {
    client,
    createTables,
    createFavorite,
    createProducts,
    createUser,
    fetchFavorites,
    fetchUsers,
    fetchProducts,
    destroyFavorite
} = require('./db');
const express = require('express');
const app = express();
app.use(express.json());

// GET /api/users - returns array of users
app.get('/api/users', async (req, res, next) => {
    try {
        res.send(await fetchUsers());
    }
    catch (ex) {
        next(ex);
    }
});
// GET /api/products - returns an array of products
app.get('/api/products', async (req, res, next) => {
    try {
        res.send(fetchProducts());
    }
    catch (ex) {
        next(ex);
    }
});
// GET /api/users/:id/favorites - returns an array of favorites for a user
app.get('/api/users/:id/favorites', async (req, res, next) => {
    try {
        res.send(await fetchFavorites());
    }
    catch (ex) {
        next(ex);
    }
});
// POST /api/users/:id/favorites - payload: a product_id returns the created favorite with a status code of 201
app.post('/api/users/:id/favorites', async (req, res, next) => {
    try {
        res.status(201).send(await createFavorite({ user_id: req.params.id, product_id: req.body.product_id }));
    }
    catch (ex) {
        next(ex);
    }
});
// DELETE /api/users/:userId/favorites/:id - deletes a favorite for a user, returns nothing with a status code of 204
app.delete('/api/users/:user_id/favorites/:id', async (req, res, next) => {
    try {
        await destroyFavorite({ user_id: req.params.user_id, id: req.params.id });
        res.sendStatus(204);
    }
    catch (ex) {
        next(ex);
    }
});

app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).send({ error: err.message ? err.message : err });
});

const init = async () => {
    const port = process.env.PORT || 3000;
    await client.connect();
    console.log('connected to database');

    await createTables();
    console.log('tables created');

    const [moe, lucy, ethyl, curly, foo, bar, bazz, quq, fip] = await Promise.all([
        createUser({ username: 'moe', password: 'm_pw' }),
        createUser({ username: 'lucy', password: 'l_pw' }),
        createUser({ username: 'ethyl', password: 'e_pw' }),
        createUser({ username: 'curly', password: 'c_pw' }),
        createProducts({ name: 'foo' }),
        createProducts({ name: 'bar' }),
        createProducts({ name: 'bazz' }),
        createProducts({ name: 'quq' }),
        createProducts({ name: 'fip' })
    ]);
    const favorites = await Promise.all([
        createFavorite({ user_id: moe.id, product_id: foo.id }),
        createFavorite({ user_id: moe.id, product_id: fip.id }),
        createFavorite({ user_id: ethyl.id, product_id: bazz.id})
    ])
    console.log("users", await fetchUsers());
    console.log("products", await fetchProducts());
    console.log("favorites", await fetchFavorites(moe.id, ethyl.id));

    console.log(`moe's id is ${moe.id}`);

    app.listen(port, () => console.log(`listening on port ${port}`));
};

init();