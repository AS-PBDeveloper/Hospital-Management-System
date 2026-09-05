import { inngest } from "./client";

export const admitPatient = inngest.createFunction(
  { id: "admit-patient", triggers: [{ event: "patient/admitted" }] },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Patient admitted: ${event.data.name}` };
  },
);
