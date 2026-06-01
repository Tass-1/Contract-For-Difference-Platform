import express from "express";
import authRoutes from "./authRoutes";
import depositRoute from "./depositRoute";
import withdrawRoute from "./withdrawRoute";
import orderRoute from "./orderRoute";
import limitOrderRoute from "./limitOrderRoute";
import chartHistory from "./chartHistory";
import btcRoute from "./btcRoute";
import getPositionRoute from "./getPositionRoute";
import getTradesRoute from "./getTradesRoute";
import closePositionRoute from "./closePositionRoute";
import getBalance from "./getBalance";

const rootRouter = express.Router();

rootRouter.use(authRoutes); 
rootRouter.use(depositRoute);
rootRouter.use(withdrawRoute);
rootRouter.use(orderRoute);
rootRouter.use(limitOrderRoute);
rootRouter.use(chartHistory);
rootRouter.use(btcRoute);
rootRouter.use(getPositionRoute);
rootRouter.use(getTradesRoute);
rootRouter.use(closePositionRoute);
rootRouter.use(getBalance);

export default rootRouter;