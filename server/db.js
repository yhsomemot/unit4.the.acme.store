// client - a node pg client
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_notes_categories_db');
const uuid = require('uuid');
const bcrypt = require('bcrypt');

// createTables method - drops and creates the tables for your application
const createTables = async () => {
    const SQL = `
      DROP TABLE IF EXISTS favorites;
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS products;
      CREATE TABLE users(
        id UUID DEFAULT gen_random_uuid(),
        username VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        PRIMARY KEY (id)
      );
      CREATE TABLE products(
        id UUID DEFAULT gen_random_uuid(),
        name VARCHAR(20),
        PRIMARY KEY (id)
      );
      CREATE TABLE favorites(
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        product_id UUID REFERENCES products(id) NOT NULL,
        CONSTRAINT unique_user_id_and_product_id UNIQUE (user_id, product_id)
      );
    `;
    await client.query(SQL);
};
// createProduct - creates a product in the database and returns the created record
const createProducts = async ({ name }) => {
    const SQL = `
      INSERT INTO products(id, name) VALUES($1, $2) RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), name]);
    return response.rows[0];
};
// createUser - creates a user in the database and returns the created record. The password of the user should be hashed using bcrypt.
const createUser = async ({ username, password }) => {
    const SQL = `
      INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), username, await bcrypt.hash(password, 5)]);
    return response.rows[0];
};
// fetchUsers - returns an array of users in the database
const fetchUsers = async () => {
    const SQL = `
      SELECT id, username FROM users;
    `;
    const response = await client.query(SQL);
    return response.rows;
};
// fetchProducts - returns an array of products in the database
const fetchProducts = async () => {
    const SQL = `
      SELECT * FROM products;
    `;
    const response = await client.query(SQL);
    return response.rows;
};
// fetchFavorites - returns an array favorites for a user
const fetchFavorites = async (user_id) => {
    const SQL = `
      SELECT * FROM favorites where user_id = $1
    `;
    const response = await client.query(SQL, [user_id]);
    return response.rows;
};
// createFavorite - creates a favorite in the database and returns the created record
const createFavorite = async ({ user_id, product_id }) => {
    const SQL = `
      INSERT INTO favorites(id, user_id, product_id) VALUES($1, $2, $3) RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), user_id, product_id]);
    return response.rows[0];
};
// destroyFavorite - deletes a favorite in the database
const destroyFavorite = async ({ user_id, id }) => {
    const SQL = `
      DELETE FROM favorites WHERE user_id=$1 AND id=$2
    `;
    await client.query(SQL, [user_id, id]);
};


module.exports = {
    client,
    createTables,
    createFavorite,
    createProducts,
    createUser,
    fetchFavorites,
    fetchUsers,
    fetchProducts,
    destroyFavorite
}