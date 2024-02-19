import {Router} from "express";
import {Request, Response} from "express";
import mysql, {ResultSetHeader, RowDataPacket} from 'mysql2/promise';
import {TaskTo} from "../to/task.to.js";
import 'dotenv/config';
import {validateOrReject, ValidationError} from "class-validator";

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT!,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionLimit: +process.env.DB_CONNECTION_LIMIT!,
})

const controller = Router();

controller.get('/', getAllTasks);

controller.post('/', saveTask);

controller.patch('/:id', updateTask);

controller.delete('/:id', deleteTask);

async function validateData(req: Request, res: Response) {
    try {
        const task = Object.assign(new TaskTo(), req.body);
        await validateOrReject(task);
        return true;
    } catch (error) {
        if (Array.isArray(error) &&
            error[0] instanceof ValidationError) {
            res.status(400).json(error);
            return false;
        } else {
            res.sendStatus(500);
            return false;
        }
    }
}

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
    const connection = await pool.getConnection();
    if (await validateData(req, res)) {
        const task = <TaskTo>req.body;
        const [{insertId}] = await connection.execute<ResultSetHeader>('INSERT INTO task (description, status, email) VALUES (?, false, ?)',
            [task.description, task.email]);
        task.id = insertId;
        task.status = false;
        res.status(201).json(task);
    }
    pool.releaseConnection(connection);
}

async function updateTask(req: Request, res: Response) {
    const connection = await pool.getConnection();
    if (await validateData(req, res)) {
        const task = <TaskTo>req.body;
        const taskId = +req.params.id;
        const [result] = await connection.execute<RowDataPacket[]>('SELECT * FROM task WHERE id = ?', [taskId]);

        if (!result.length) {
            res.sendStatus(404);
            return;
        } else {
            await connection.execute('UPDATE task SET description = ?, status = ? WHERE id = ?',
                [task.description, task.status, taskId]);
            res.sendStatus(204);
        }
    }
    pool.releaseConnection(connection);
}

async function deleteTask(req: Request, res: Response) {
    const taskId = +req.params.id;
    const connection = await pool.getConnection();
    const [result] = await connection.execute<RowDataPacket[]>('SELECT * FROM task WHERE id = ?',
        [taskId]);
    if (!result.length) {
        res.sendStatus(404);
    } else {
        await connection.execute('DELETE FROM task WHERE id = ?',
            [taskId]);
        res.sendStatus(204);
    }
    pool.releaseConnection(connection);
}

export {controller as TaskHttpController};