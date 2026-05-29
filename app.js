const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const sequelize = require('./database');
const Film = require('./models/Film');
const User = require('./models/User');
const authMiddleware = require('./middlewares/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'secret_key_films';

app.use(express.json());

//Aqui es para registrar los usuarios en la maquila q show ahi
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: 'Username and password are required'
            });
        }

        const existingUser = await User.findOne({
            where: { username }
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'Username already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            password: hashedPassword
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                username: user.username
            }
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error registering user',
            error: error.message
        });
    }
});


//Esta zona la usamor para iniciar sesion en la maquila
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: 'Username and password are required'
            });
        }

        const user = await User.findOne({
            where: { username }
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({
                message: 'Invalid password'
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username
            },
            JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        res.status(200).json({
            message: 'Login successful',
            token: token
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error logging in',
            error: error.message
        });
    }
});

//Esta zona la usamos para el apartado de Get jeje

app.get('/films', authMiddleware, async (req, res) => {

    try {

        const films = await Film.findAll();

        res.status(200).json(films);

    } catch (error) {

        res.status(500).json({
            message: 'Error retrieving films',
            error: error.message
        });

    }

});

//Aqui usamos el post para el agregado de las peliculas LOOOl

app.post('/films', authMiddleware, async (req, res) => {

    try {

        const { title, director, year, genre } = req.body;

        const newFilm = await Film.create({
            title,
            director,
            year,
            genre
        });

        res.status(201).json({
            message: 'Film created successfully',
            film: newFilm
        });

    } catch (error) {

        res.status(500).json({
            message: 'Error creating film',
            error: error.message
        });

    }

});



//El put lo usamos para actualizar los datos de las peliculas

app.put('/films/:id', authMiddleware, async (req, res) => {

    try {

        const { id } = req.params;

        const { title, director, year, genre } = req.body;

        const film = await Film.findByPk(id);

        if (!film) {

            return res.status(404).json({
                message: 'Film not found'
            });

        }

        await film.update({
            title,
            director,
            year,
            genre
        });

        res.status(200).json({
            message: 'Film updated successfully',
            film
        });

    } catch (error) {

        res.status(500).json({
            message: 'Error updating film',
            error: error.message
        });

    }

});


//Delete para eliminar, quien lo diria que se podria hacer el codigo por telepatía 

app.delete('/films/:id', authMiddleware, async (req, res) => {

    try {

        const { id } = req.params;

        const film = await Film.findByPk(id);

        if (!film) {

            return res.status(404).json({
                message: 'Film not found'
            });

        }

        await film.destroy();

        res.status(200).json({
            message: 'Film deleted successfully'
        });

    } catch (error) {

        res.status(500).json({
            message: 'Error deleting film',
            error: error.message
        });

    }

});




//Aqui iniciamos el server

async function startServer() {

    try {

        await sequelize.authenticate();
        console.log('Database connected');

        await sequelize.sync({ force: false });

        const count = await Film.count();

//datos para no iniciar vacio el server
        if (count === 0) {

            await Film.bulkCreate([
                {
                    title: 'Interstellar',
                    director: 'Christopher Nolan',
                    year: 2014,
                    genre: 'Science Fiction'
                },
                {
                    title: 'Titanic',
                    director: 'James Cameron',
                    year: 1997,
                    genre: 'Drama'
                },
                {
                    title: 'The Matrix',
                    director: 'The Wachowskis',
                    year: 1999,
                    genre: 'Action'
                }
            ]);

            console.log('Sample data inserted');
        }

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

    } catch (error) {

        console.error('Server error:', error);

    }

}

startServer();