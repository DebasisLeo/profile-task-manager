const db = require('../db/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = (req, res, next) => {
    const { username, email, password, role } = req.body;

    
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    
    const userRole = role === 'admin' ? 'admin' : 'user';

    
    db.query(
        'SELECT * FROM users WHERE email=? OR username=?',
        [email, username],
        (err, results) => {
            if (err) return next(err);

            if (results.length > 0) {
                return res.status(400).json({ error: 'Username or email already exists' });
            }

          
            const hashedPassword = bcrypt.hashSync(password, 10);

           
            db.query(
                'INSERT INTO users (username, email, password, role) VALUES (?,?,?,?)',
                [username, email, hashedPassword, userRole],
                (err, result) => {
                    if (err) return next(err);
                    res.status(201).json({
                        message: `User registered successfully as ${userRole}`,
                        userId: result.insertId,
                        role: userRole
                    });
                }
            );
        }
    );
};
exports.deleteUser = (req, res, next) => {
    const userIdToDelete = req.params.id;

    
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    db.query('DELETE FROM users WHERE id=?', [userIdToDelete], (err, result) => {
        if (err) return next(err);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    });
};

exports.login = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    db.query('SELECT * FROM users WHERE email=?', [email], (err, results) => {
        if (err) return next(err);

        if (results.length === 0) return res.status(400).json({ error: 'User not found' });

        const user = results[0];

      
        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) return res.status(400).json({ error: 'Incorrect password' });

        
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, role: user.role });
    });
};
