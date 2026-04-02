import { router, createCallerFactory } from "./trpc";
import { talentRouter } from "./routers/talent";
import { projectRouter } from "./routers/project";
import { applicationRouter } from "./routers/application";
import { reviewRouter } from "./routers/review";
import { paymentRouter } from "./routers/payment";
import { skillRouter } from "./routers/skill";

export const appRouter = router({
  talent: talentRouter,
  project: projectRouter,
  application: applicationRouter,
  review: reviewRouter,
  payment: paymentRouter,
  skill: skillRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
export { type Context } from "./trpc";
