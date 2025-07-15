import { Request, Response } from "express";
import { db } from "../configs/db.config";
import { tasks , users} from "../db/schema";
import { eq } from "drizzle-orm";
import { mailer } from "../utils/mailer";
export const createTask = async (req: Request, res: Response) => {
  const {
    title,
    desc,
    limit = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  } = req.body;

  if (!title && !desc) {
    res.status(404).json({ message: "no data parsing" });
    return;
  }
  try {
    const is_Exsit = await db.select().from(tasks).where(eq(tasks.title, title));
  if (is_Exsit.length > 0) {
    res.status(404).json({ message: "this Task Already Exist !" });
    return;
  }

  const newTask = await db.insert(tasks).values({
    title : title,
    desc : desc,
    limit : limit
  })
  .returning();

  if (!newTask){
    res.status(404).json({message : "something Wrong! can't Create Task !"})
    return;
  }

  const _users  = await db.select({
    email : users.email
    })
    .from(users).where(eq(users.role , "user"));
    const emails = _users.map((user) => user.email);
    await mailer(emails,'New Task Announcment!' ,
        `Dear Students There is New Task : 
        Title : ${title}
        Due Date : ${limit}`
    );
    res.status(201).json({message : "Task Created Successfully and Emails sent :) "});
    return;
  } catch (error : any) {
    res.status(500).json({ message: "Internal Server Error" , error});
    return;
  }
};