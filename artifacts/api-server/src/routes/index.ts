import { Router, type IRouter } from "express";
import healthRouter from "./health";
import kolsRouter from "./kols";
import campaignsRouter from "./campaigns";
import casesRouter from "./cases";
import applicationsRouter from "./applications";
import sectionsRouter from "./sections";
import tagsRouter from "./tags";
import uploadRouter from "./upload";
import authRouter from "./auth";
import usersRouter from "./users";
import postsRouter from "./posts";
import submissionsRouter from "./submissions";
import projectRequestsRouter from "./project_requests";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(kolsRouter);
router.use(campaignsRouter);
router.use(submissionsRouter);
router.use(casesRouter);
router.use(applicationsRouter);
router.use(sectionsRouter);
router.use(tagsRouter);
router.use(uploadRouter);
router.use(usersRouter);
router.use(postsRouter);
router.use(projectRequestsRouter);

export default router;
