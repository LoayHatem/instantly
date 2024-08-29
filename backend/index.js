// ESM
import Fastify from "fastify";
import routes from "./src/routes/index.js";
import DB from "./src/db/index.js";
import cors from "@fastify/cors";

/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
  logger: true,
});

fastify.register(cors, {
  origin: "http://localhost:3000",
});

fastify.register(routes);

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT }, function (err, address) {
      if (err) {
        fastify.log.error(err);
        process.exit(1);
      }
      fastify.log.info(`server listening on ${address}`);
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
