import express from "express";
import prisma from '../../prismaClient.js'
import authorizeRole from '../../middleware/authorizeRole.js'
import { sendEmail } from '../../utils/mailer.js'

const router = express.Router();

router.post('/create' , authorizeRole("admin") ,async(req,res) => {
    const { title , desc , limit } = req.body;
    try {
        const isFound = await prisma.task.findUnique({
            where : {
                title, 
            }
        })

        if(isFound)
            return res.status(409).json({ message: "Task already exists." });
        
        let limitDate;
        if (limit) {
            limitDate = new Date(limit);

            const now = new Date();
            if (limitDate <= now) {
                return res.status(400).json({ message: "Limit date must be in the future." });
            }
        } else {
            const now = new Date();
            const nextWeek = new Date();
            nextWeek.setDate(now.getDate() + 7);
            nextWeek.setHours(0, 0, 0, 0); 
            limitDate = nextWeek;
        }

        const newTask = await prisma.task.create({
            data : {
                title ,
                desc ,
                limit : limitDate
            }
        })

        const emails = await prisma.user.findMany({
            where : {
                verified : true,
                role : "user"
            },
            select : {
                email : true
            },
        });

        const emailList = emails.map(user => user.email)

        const content = `
            Dear students,

            There is a new task!

            Task Title: ${newTask.title}
            Description: ${newTask.desc}
            Deadline: ${newTask.limit}

            Good luck!
            `;
            if(emailList.length>0)
                sendEmail(emailList, "New Task", content);

        return res.status(201).json({ message: "Task Created." , newTask });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.put('/update' , authorizeRole("admin"), async(req , res) => {
    const {id ,title , desc , limit} = req.body;
    try {
        const isFound = await prisma.task.findUnique({
            where : {
                id, 
            }
        })

        if(!isFound)
            return res.status(404).json({ message: "There is No Task exists." });

        let limitDate;
        if (limit) {
            limitDate = new Date(limit);

            const now = new Date();
            if (limitDate <= now) {
                return res.status(400).json({ message: "Limit date must be in the future." });
            }
        }

        const update = await prisma.task.update({
            where : {
                id
            },
            data : {
                ...(title && { title }),
                ...(desc && { desc }),
                ...(limit && { limit: limitDate })
            }
        });

        return res.status(200).json({message : "task Updated Successfully!" , update});
    } catch (error) {
        res.status(500).json({message : error.message});
    }
});

router.delete('/delete/:id' , authorizeRole("admin") , async (req,res) => {
    const  id = req.params.id;

    try {
        const isFound = await prisma.task.findUnique({
            where : {
                id : parseInt(id)
            }
        })
    
        if(!isFound){
            return res.status(404).json({message : "the tsak is not exist !!"});
        }
    
        const deletedTask  =  await prisma.task.delete({
            where : {
                id  : parseInt(id)
            }
        })

        return res.status(200).json({message : "Tsak Deleted Successfullly ..."});
    } catch (error) {
        res.status(500).json({message : error.message});
    }
    
})

router.get('/all', async (req,res)=>{
    try {
        const tasks = await prisma.task.findMany({
            select : {
                id : true,
                title : true,
                desc : true,
                createdAt : true,
                limit : true
            }
        })

        if(tasks.length === 0){
            return res.status(404).json({message : "there is no Task Today"})
        }

        return res.status(200).json({ message: "Tasks fetched successfully", tasks })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.get('/task/:id' , async (req,res) => {
    const id = req.params.id;
    try {
        const task = await prisma.task.findUnique({
            where : {
                id : parseInt(id)
            }
        })

        if(!task)
            return res.status(404).json({message : "No Task Found!!"});

        return res.status(200).json({message : "Task fetched successfully",task });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

export default router;