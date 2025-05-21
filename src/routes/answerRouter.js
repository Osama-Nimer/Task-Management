import express from "express";
import authorizeRole from '../middleware/authorizeRole.js'
import {submit , evaluate , getAllAnswers , mySub , getAnsweByUserId , repoEdit } 
    from '../controller/answerController.js'

const router = express.Router();

router.post('/submit',authorizeRole("user") , submit);

router.put('/evaluate', authorizeRole("admin") ,evaluate);

router.get('/', authorizeRole("admin"), getAllAnswers);

router.get('/mySub',authorizeRole("user"), mySub);

router.get('/byUser/:user_id', authorizeRole("admin"), getAnsweByUserId);
/* User Can Edit there Repo  Only*/
router.put('/repoEdit' , authorizeRole("user") , repoEdit);

export default router;