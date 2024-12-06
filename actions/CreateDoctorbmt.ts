"use server";
import { createDoctor } from "./Doctor";

const SkGuptaData = {
  name: "Dr.SKGUPTA",
  website: "https://hematologybmt.com",
  whatsapp: "+917337541403",
  services: [
    { name: "Other" },
    { name: "Immunotherapy" },
    { name: "CAR T- Cells" },
    { name: "Half Matched Transplant BMT" },
    { name: "Allogeneic BMT" },
    { name: "Unrelated BMT" },
    { name: "Autologous BMT" },
    { name: "Erdheim Chester Disease" },
    { name: "VEXAS Syndrome" },
    { name: "Porphyrias" },
    { name: "Hemochromatosis" },
    { name: "LCH" },
    { name: "Hemophagocytic Syndrome (HLH)" },
    { name: "Storage Disorders" },
    { name: "Immunodeficiency" },
    { name: "IgG4-RD" },
    { name: "Platelets & WBC" },
    { name: "Unexplained high or low Hb" },
    { name: "ALPS" },
    { name: "Multiple Sclerosis" },
    { name: "Recurrent Abortions" },
    { name: "Recurrent Infections" },
    { name: "Bleeding and Clotting disorders" },
    { name: "DVT" },
    { name: "Sickle Cell Anemia" },
    { name: "Thalassemia" },
    { name: "ITP, TTP, FNAIT, AIHA, PNH" },
    { name: "Aplastic Anemia" },
    { name: "Pancytopenia" },
    { name: "MGUS" },
    { name: "Mastocytosis" },
    { name: "Myelofibrosis" },
    { name: "Blood Cancer" },
    { name: "MDS" },
    { name: "Myeloma" },
    { name: "Lymphoma" },
    { name: "Leukemia" },
  ],
};

export async function SkGupta() {
  try {
    const response = await createDoctor(SkGuptaData);
    console.log("skGupta:", response);
  } catch (err) {
    console.error(err);
  }
}
