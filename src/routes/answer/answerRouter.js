import express from "express";
import prisma from "../../prismaClient.js";
import {isValidRepoLink} from '../../utils/helper.js'
import {convertGitLinkToHttp} from '../../utils/helper.js'
import {gitCheck} from '../../utils/gitCheck.js'
import {sendEmail} from '../../utils/mailer.js'
import authorizeRole from '../../middlware/authorizeRole.js'
const router = express.Router();

router.post('/submit',authorizeRole("user") , async (req,res) => {
    let {task_id , repo } = req.body;
    const user_id = req.user.id;

    try {
        const taskExist = await prisma.task.findUnique({
            where: {
                id : parseInt(task_id)
            }
        })

        if(!taskExist)
            return res.status(404).json({ message: "No Task Exist!" });

        const now = Date.now();
        const deadline = taskExist.limit.getTime();

        if (deadline < now) {
            return res.status(403).json({ message: "You can't submit this task now, it's too late!" });
        }

        const is_submitted = await prisma.answer.findFirst({
            where: {
                user_id: parseInt(user_id),
                task_id: parseInt(task_id)
            }
        });

        if(is_submitted)
            return res.status(400).json({ message: "You already submitted this task!" });
        

        if (!isValidRepoLink(repo)) 
            return res.status(400).json({ message: "Repository link is invalid." });

        repo = convertGitLinkToHttp(repo);

        const repoStatus = await gitCheck(repo);
        if (repoStatus !== 'public') 
            return res.status(403).json({ message: `Repository is ${repoStatus}.` });
        
        const newAnswer = await prisma.answer.create({
            data : {
                task_id : parseInt(task_id),
                user_id : parseInt(user_id),
                repo : repo,
                status : true
            }
        });

        await sendEmail(
            req.user.email,
            "Task Submission",
            `Dear ${req.user.first_name},\nYou have successfully submitted the task. \n${newAnswer.repo}\n At : ${newAnswer.submittedAt} `
        );

    return res.status(201).json({message : "You Have been Submitted Answer Successfully " , newAnswer});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});



router.put('/evaluate', authorizeRole("admin") ,async (req,res) => {
    const { user_id , task_id , answer_id , grade , feedback=" " } = req.body;
    const admin = req.user;
    try {

        if (isNaN(user_id) || isNaN(answer_id) || isNaN(task_id) || isNaN(grade) )
            return res.status(400).json({ message: "Invalid input data type" });

        const is_Exist = await prisma.answer.findFirst({
            where : {
                id : parseInt(answer_id),
                user_id : parseInt(user_id) ,
                task_id : parseInt(task_id)
            }
        });

        if(!is_Exist)
            return res.status(403).json({message : "there is no submition from this user"})

        if (typeof is_Exist.grade === 'number')
            return res.status(403).json({message : "This answer is already evaluated!"});

        if(grade > 10 || grade < 0)
            return res.status(403).json({ message : "The grade must be between 0 and 10." })

        const updatedAnswer = await prisma.answer.update({
            where : {
                id : parseInt(answer_id)
            },
            data : {
                grade : parseInt(grade),
                feedback : feedback
            }
        });

        const user = await prisma.user.findUnique({
            where : {
                id : parseInt(user_id)
            }
        })

        const task = await prisma.task.findUnique({
            where : {
                id : parseInt(task_id)
            }
        })

        

        await sendEmail(user.email,
            "Task Feedback",
            `Dear ${user.first_name},\n\n
            You have been evaluated by ${admin.first_name} ${admin.last_name}.\n
            Task: ${task.title}\n
            Date: ${new Date().toLocaleString()}`

        );


        return res.status(200).json({message : "Answer Evaluated Successfully"});
    } catch (error) {
        res.status(500).json({message : error.message})
    }
});

router.get('/',authorizeRole("admin"),async(req,res) => {
    try {
        const answers = await prisma.answer.findMany({
            select : {
                id : true,
                repo : true,
                grade : true,
                feedback : true,
                user : {
                    select : {
                        id : true,
                        first_name : true,
                        last_name: true,
                        email: true,

                    }
                },
                task : {
                    select: {
                        id: true,
                        title: true,
                    }
                },
                submittedAt : true,
            },
            orderBy: {
                submittedAt: 'desc'
            }
        })

        if(answers.length === 0)
            return res.status(200).json({ message: "No tasks have been submitted yet.", answers: [] });

        return res.status(200).json({ message: "Submitted answers fetched successfully", answers });
    } catch (error) {
        res.status(500).json({message : error.message});
    }
});

router.get('/mySub',authorizeRole("user"),async(req,res) => {
    const user = req.user;

    try {
        const sub = await prisma.answer.findMany({
            where : {
                user_id : parseInt(user.id)
            },
            select : {
                id : true,
                task : {
                    select : {
                        title : true,
                    }
                },
                status : true,
                grade : true,
                feedback : true,
                submittedAt : true
            }
        });

        if(sub.length === 0)
            return res.status(200).json({message : "You haven't submitted any tasks yet." , sub : []});

        return res.status(200).json({message : "Submitted answers fetched successfully" , sub})
    } catch (error) {
        res.status(500).json({message : error.message});
    }
});


router.get('/byUser/:user_id', authorizeRole("admin"), async (req, res) => {
    const user_id = parseInt(req.params.user_id);
    
    if (isNaN(user_id)) 
        return res.status(400).json({ message: "Invalid user ID" });

    try {
        const answers = await prisma.answer.findMany({
            where: {
                user_id: user_id
            },
            select: {
                id: true,
                repo: true,
                grade: true,
                feedback: true,
                submittedAt: true,
                task: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            orderBy: {
                submittedAt: 'desc'
            }
        });

        if(answers.length === 0)
            return res.status(200).json({message : "You haven't submitted any tasks yet." , answers : []});

        return res.status(200).json({ message: "Answers fetched successfully", answers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;