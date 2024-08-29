// seeds/initial_data.js
import { faker } from "@faker-js/faker";

const LEAD_COUNT = 100;
const EMAIL_COUNT = 300;
const CHUNK_SIZE = 50; // Define chunk size

export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("email_lead").del();
  await knex("emails").del();
  await knex("leads").del();

  // Create leads
  const leads = [];
  for (let i = 0; i < LEAD_COUNT; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const randomNumber = faker.number.int({ min: 99, max: 999 });
    leads.push({
      email: faker.internet.email({ firstName, lastName: `${lastName}_${randomNumber}` }).toLowerCase(),
      firstName,
      lastName,
      job: faker.person.jobTitle(),
    });
  }

  // Insert leads in chunks
  for (let i = 0; i < leads.length; i += CHUNK_SIZE) {
    const chunk = leads.slice(i, i + CHUNK_SIZE);
    await knex("leads").insert(chunk);
  }

  // Create emails
  const emails = [];
  for (let i = 0; i < EMAIL_COUNT; i++) {
    emails.push({
      subject: faker.lorem.sentence(),
      body: faker.lorem.paragraphs(3),
      created_at: faker.date.past(),
    });
  }

  // Insert emails in chunks
  for (let i = 0; i < emails.length; i += CHUNK_SIZE) {
    const chunk = emails.slice(i, i + CHUNK_SIZE);
    await knex("emails").insert(chunk);
  }

  // Retrieve all inserted leads and emails
  const allLeads = await knex("leads").select("id");
  const allEmails = await knex("emails").select("id");

  // Create email_lead relationships
  const emailLeadRelations = [];
  for (const email of allEmails) {
    const recipientCount = faker.number.int({ min: 1, max: 5 });
    const recipients = faker.helpers.shuffle(allLeads).slice(0, recipientCount);

    for (const recipient of recipients) {
      emailLeadRelations.push({
        email_id: email.id,
        lead_id: recipient.id,
        type: faker.helpers.arrayElement(["to", "cc", "bcc"]),
      });
    }
  }

  // Insert email_lead relations in chunks
  for (let i = 0; i < emailLeadRelations.length; i += CHUNK_SIZE) {
    const chunk = emailLeadRelations.slice(i, i + CHUNK_SIZE);
    await knex("email_lead").insert(chunk);
  }
}
