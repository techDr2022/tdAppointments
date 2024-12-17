"use server";
import { createDoctor } from "./Doctor";

const DrAvaniReddyData = {
  name: "Dr.AvaniReddy",
  website: "https://www.dravanireddy.com",
  whatsapp: "+917337541403",
};

export async function CreateDrAvani() {
  try {
    const response = await createDoctor(DrAvaniReddyData);
    console.log("DrAvaniReddy:", response);
  } catch (err) {
    console.error(err);
  }
}
