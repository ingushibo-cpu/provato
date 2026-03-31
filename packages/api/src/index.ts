import { router, createCallerFactory } from "./trpc";
import { talentRouter } from "./routers/talent";
import { projectRouter } from "./routers/project";
import { applicationRouter } from "./routers/application";
import { reviewRouter } from "./routers/review";
import { paymentRouter } from "./routers/payment";

export const appRouter = router({
  talent: talentRouter,
  project: projectRouter,
  application: applicationRouter,
  review: reviewRouter,
  payment: paymentRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
export { type Context } from "./trpc";
