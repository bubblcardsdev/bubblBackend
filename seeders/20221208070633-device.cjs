"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    // await queryInterface.bulkInsert(
    //   "Devices",
    //   [
    //     {
    //       deviceUid: "abc121",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "abc122",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "abc123",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "abc124",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "abc125",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "abc126",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "abc127",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "abc128",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "abc129",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "abc130",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "abc131",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "abc132",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "abc133",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "abc134",
    //       deviceType: "Socket",
    //     },
    //     {
    //       deviceUid: "abc135",
    //       deviceType: "Socket",
    //     },
    //     {
    //       deviceUid: "8c98a65d-0747-4a11-be66-38101d14f1d7",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "8982a690-fd3b-4151-9c5a-559ab7022899",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "e48863b8-8573-4596-9c54-26eaad839091",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "a025139e-98b9-47e4-9ed7-5e3c4e07c117",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "cfcb46ab-1d29-4699-b51e-fd28889335d1",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "c5c3ba7b-a383-43b1-b228-f989d8e8c89b",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "2a78eff6-e5b2-49c3-b50f-3f64a9203a82",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "994e1ff2-8e37-420d-8e89-424ae8b862aa",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "e292b73b-a086-4637-9a44-2e02f24eb33c",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "1fa7e6a0-8aca-45df-a110-b094f1dea71b",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "db6187f2-95bb-4c64-9eed-ce4c2e41a098",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "56f3976e-53b8-4202-b082-15f483a65865",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "f8a7cb2c-8d79-41ab-b040-011f2c4a5acb",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "52654077-fe34-403b-a17d-b1cf84b8f940",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "fbfe5fcc-70fb-42a4-ab63-23145be4aa8f",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "70b222e1-6721-4f42-8ec1-77f440c93231",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "b12a0bd1-5d2a-4b70-8171-870425e01909",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "59567c20-fcc5-4162-aba0-12ad1fa335d9",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "378eab13-18cb-49eb-a924-91d4d0e6f49f",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "6b158688-3372-460f-85a3-0638ce7d1572",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "f389a483-3167-4eec-b8a5-9929c65b14fa",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "918a6c89-50c0-4238-b870-d8099e9b5c12",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "b7629432-0d2e-4922-934f-7c610e1ff2db",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "08114958-7635-4bcf-8d4c-4f0f5ef348c2",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "0a2a3072-cb93-4b5e-a006-a55d25319a33",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "8a333b4d-7a54-403a-ad1d-0c659334d3f6",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "f2bbf0f6-afed-4995-bfc3-c6594b47f618",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "77c0340a-7af4-4ba4-90cc-2ae973f3ac00",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "c529bf39-0a9d-4842-b292-e928b7db05bd",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "479231c3-04ad-4621-9149-5713484000a9",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "3cccde66-422f-4ea0-acef-44b9438eca91",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "0bf87c28-ce1b-410e-871f-32d9bc3f391c",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "363f160a-7645-42c2-9756-a1e16f28dcf1",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "03e0d88b-986b-4b67-a579-e6220a547b1e",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "7b911aa2-7c07-4d1c-8c1a-40429d1bacbd",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "b682e2a4-efd6-407b-8e00-d392fedd28b7",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "f90ccb6b-f7c5-4e86-81e3-06a1c077f761",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "bb99346c-470b-43db-aacd-9b060f2b87ea",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "52e06e9f-d270-49dd-978d-9e58ebf2aa15",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "fa0d6bb9-2cd3-4e03-931a-925bc780368b",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "01edf7d8-1ee7-4457-a4b8-1e6916976352",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "86a920bb-ebe4-44d2-bbc5-0721c6590840",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "2d37aa55-cc9b-4f2e-964f-4aef3d4ebe30",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "e765a8e9-de49-45b9-82b7-29c531d47e73",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "4f236b26-0ac3-42b4-b56a-b2784e79046f",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "e7cf9ae6-7d57-4c2f-90ab-7d39d8ebab6f",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "09ddb9e2-a010-4ebf-8d30-c2bf92109baf",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "0a851750-ffee-4d8a-8a67-96cd985a4983",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "1e43da95-8939-4c94-98be-c99c2157ec13",
    //       deviceType: "Card",
    //     },
    //     {
    //       deviceUid: "a0a2d6d0-f16f-4aaa-8789-81dca1573cdd",
    //       deviceType: "Card",
    //     },
    //   ],
    //   { fields: ["deviceUid"], ignoreDuplicates: true }
    // );
  },
};
