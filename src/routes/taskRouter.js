import express from "express";
import authorizeRole from '../middleware/authorizeRole.js'
import  {create , update, deleteTask , getAllTasks ,getTaskById} from '../controller/taskController.js'

const router = express.Router();

router.post('/create' , authorizeRole("admin") , create);

router.put('/update' , authorizeRole("admin"), update);

router.delete('/delete/:id' , authorizeRole("admin") , deleteTask)

router.get('/all',getAllTasks );

router.get('/task/:id' , getTaskById)

export default router;