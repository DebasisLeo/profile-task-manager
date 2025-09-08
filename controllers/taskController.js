const db = require('../db/connection');

exports.createTask = (req, res, next) => {
    const { title, description, status } = req.body;
    const userId = req.user.id;

    db.query('INSERT INTO tasks (title, description, status, user_id) VALUES (?,?,?,?)',
        [title, description, status || 'pending', userId],
        (err, result) => {
            if (err) return next(err);
            res.status(201).json({ message: 'Task created', taskId: result.insertId });
        });
};

exports.getTasks = (req, res, next) => {
    const userId = req.user.id;

    db.query('SELECT * FROM tasks WHERE user_id=?', [userId], (err, results) => {
        if (err) return next(err);
        res.json(results);
    });
};

exports.updateTask = (req, res, next) => {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const userId = req.user.id;

    db.query('UPDATE tasks SET title=?, description=?, status=? WHERE id=? AND user_id=?',
        [title, description, status, id, userId],
        (err, result) => {
            if (err) return next(err);
            res.json({ message: 'Task updated' });
        });
};

exports.deleteTask = (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    db.query('DELETE FROM tasks WHERE id=? AND user_id=?', [id, userId], (err, result) => {
        if (err) return next(err);
        res.json({ message: 'Task deleted' });
    });
};
