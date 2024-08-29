import knex from "knex";
import knexfile from "../../knexfile.js";

const db = knex(knexfile.development);

export default class DB {
  static async addLead(data) {
    return knex("leads").insert(data);
  }

  static async getAllEmails() {
    return db("emails")
      .select(
        "emails.*",
        db.raw("GROUP_CONCAT(DISTINCT CASE WHEN email_lead.type = 'to' THEN leads.email END) as to_recipients"),
        db.raw("GROUP_CONCAT(DISTINCT CASE WHEN email_lead.type = 'cc' THEN leads.email END) as cc_recipients"),
        db.raw("GROUP_CONCAT(DISTINCT CASE WHEN email_lead.type = 'bcc' THEN leads.email END) as bcc_recipients"),
        db.raw("GROUP_CONCAT(DISTINCT JSON_OBJECT('id', leads.id, 'email', leads.email, 'firstName', leads.firstName, 'lastName', leads.lastName)) as lead_data")
      )
      .leftJoin("email_lead", "emails.id", "email_lead.email_id")
      .leftJoin("leads", "email_lead.lead_id", "leads.id")
      .groupBy("emails.id")
      .orderBy("emails.created_at", "desc");
  }

  static async searchEmails(searchText) {
    return db("emails")
    .select(
      "emails.*",
      db.raw("GROUP_CONCAT(DISTINCT CASE WHEN email_lead.type = 'to' THEN leads.email END) as to_recipients"),
      db.raw("GROUP_CONCAT(DISTINCT CASE WHEN email_lead.type = 'cc' THEN leads.email END) as cc_recipients"),
      db.raw("GROUP_CONCAT(DISTINCT CASE WHEN email_lead.type = 'bcc' THEN leads.email END) as bcc_recipients"),
      db.raw("GROUP_CONCAT(DISTINCT JSON_OBJECT('id', leads.id, 'email', leads.email, 'firstName', leads.firstName, 'lastName', leads.lastName)) as lead_data")
    )
    .where(function () {
      this.where("leads.email", "like", `%${searchText}%`)
        .orWhere("leads.firstName", "like", `%${searchText}%`)
        .orWhere("leads.lastName", "like", `%${searchText}%`)
        .orWhere("emails.subject", "like", `%${searchText}%`)
        .orWhere("emails.body", "like", `%${searchText}%`);
    })
    .leftJoin("email_lead", "emails.id", "email_lead.email_id")
    .leftJoin("leads", "email_lead.lead_id", "leads.id")
    .groupBy("emails.id")
    .orderBy("emails.created_at", "desc");
  }

  static async addEmail(data) {
    const { to, cc, bcc, subject, body } = data;

    const trx = await db.transaction();

    try {
      const [emailId] = await trx("emails").insert({ subject, body });

      const addLeadsAndRelations = async (recipients, type) => {
        for (const recipient of recipients) {
          const lead = await trx("leads").where("email", recipient.toLowerCase()).first();
          let leadId;
          if (!lead) {
            const [result] = await trx("leads").insert({ email: recipient.toLowerCase() });
            leadId = result.id;
          } else {
            leadId = lead.id;
          }

          await trx("email_lead").insert({
            email_id: emailId,
            lead_id: leadId,
            type,
          });
        }
      };

      await addLeadsAndRelations(to, "to");
      if (cc) await addLeadsAndRelations(cc, "cc");
      if (bcc) await addLeadsAndRelations(bcc, "bcc");

      await trx.commit();
      return this.getEmailById(emailId);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async getEmailById(id) {
    const email = await db("emails").where({ id }).first();
    if (!email) return null;

    const recipients = await db("email_lead")
      .join("leads", "email_lead.lead_id", "leads.id")
      .where("email_lead.email_id", id)
      .select("leads.email", "email_lead.type");

    email.to = recipients.filter((r) => r.type === "to").map((r) => r.email);
    email.cc = recipients.filter((r) => r.type === "cc").map((r) => r.email);
    email.bcc = recipients.filter((r) => r.type === "bcc").map((r) => r.email);

    return email;
  }

  static async getEmailSuggestions() {
    return db("leads");
  }

  static async runMigrations() {
    return db.migrate.latest();
  }
}
