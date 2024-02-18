import {Router} from "express";
import {Request, Response} from "express";
import mysql, {ResultSetHeader} from 'mysql2/promise';
import {TaskTo} from "../to/task.to.js";

const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    database: 'dep11_to_do_app_backend',
    user: 'root',
    password: '1234',
    connectionLimit: 10,
})

const controller = Router();

controller.get('/', getAllTasks);

controller.post('/', saveTask);

controller.patch('/:id', updateTask);

controller.delete('/:id', deleteTask);

async function getAllTasks(req: Request, res: Response) {
    if (!req.query.email) {
        res.sendStatus(400);
    }

    const connection = await pool.getConnection();
    const [taskList] = await connection.execute('SELECT * FROM task WHERE email = ?', [req.query.email]);
    res.json(taskList);
    pool.releaseConnection(connection);

}

async function saveTask(req: Request, res: Response) {
    const task = <TaskTo> req.body;
    const connection = await pool.getConnection();
    const [{insertId}] = await connection.execute<ResultSetHeader>('INSERT INTO task (description, status, email) VALUES (?, false, ?)',
        [task.description, task.email]);
    task.id = insertId;
    task.status = false;
    res.status(201).json(task);
    pool.releaseConnection(connection);
}

function updateTask(req: Request, res: Response) {
    res.send('<h1>Task Controller Patch</h1>');
}

function deleteTask(req: Request, res: Response) {
    res.send('<h1>Task Controller Delete</h1>');
}

export {controller as TaskHttpController};