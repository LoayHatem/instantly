import DB from "../db";

export default async function routes(fastify, options) {
  fastify.get("/emails", async (request, reply) => {
    const { search } = request.query;

    if (search) {
      return DB.searchEmails(search);
    } else {
      return DB.getAllEmails();
    }
  });

  fastify.post("/emails", async (request, reply) => {
    const newEmail = request.body;
    const insertedEmail = await DB.addEmail(newEmail);
    return { success: true, email: insertedEmail };
  });

  fastify.get("/email-suggestions", async (request, reply) => {
    try {
      const suggestions = await DB.getEmailSuggestions();
      return suggestions;
    } catch (error) {
      reply.code(500).send({ error: "Failed to fetch email suggestions" });
    }
  });
}
