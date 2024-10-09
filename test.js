/* eslint-disable no-unused-vars */
// import { writeFile } from "fs/promises";
// import { fileURLToPath } from "url";
// import path from "path";

const profileData = [
    {
      "Name": "Dharma Dharmarajan",
      "Batch": "1962",
      "Email": "dharma.tx@gmail.com",
      "Phone": "2145194620",
      "Country_Code": "1",
      "device_id": "b26320b6-224b-40d2-a077-e24e8b337686"
    },
    {
      "Name": "Ravinder Rao",
      "Batch": "1962",
      "Email": "ravi646@hotmail.com",
      "Phone": "6479816033",
      "Country_Code": "1",
      "device_id": "15a39013-a7ed-403f-a0ff-02a3b00a8f32"
    },
    {
      "Name": "Jagi Shahani",
      "Batch": "1963",
      "Email": "jagi@jagishahani.com",
      "Phone": "4084827171",
      "Country_Code": "1",
      "device_id": "1d2d7543-27b9-4747-88ad-0e46272f97ff"
    },
    {
      "Name": "Prithvi G Thambuswamy",
      "Batch": "1964",
      "Email": "thambuswamyfamily@yahoo.com",
      "Phone": "9186078012",
      "Country_Code": "1",
      "device_id": "49e1e3d8-537b-4a1e-a297-bc3374c81e64"
    },
    {
      "Name": "Kalyanraman Bharathan",
      "Batch": "1967",
      "Email": "KBharathan@icloud.com",
      "Phone": "5204294172",
      "Country_Code": "1",
      "device_id": "fb325bdc-bfcb-43a5-bd83-99e80db2e9f3"
    },
    {
      "Name": "M Ramakrishna Prabhu",
      "Batch": "1967",
      "Email": "nonche1@yahoo.com",
      "Phone": "7132949912",
      "Country_Code": "1",
      "device_id": "cefdcf31-858a-4e6b-b14c-13412f09a095"
    },
    {
      "Name": "M George Thomas",
      "Batch": "1967",
      "Email": "thomasm51@bellsouth.net",
      "Phone": "9857746487",
      "Country_Code": "1",
      "device_id": "a30ea91a-e614-4413-a7cf-69917fea023b"
    },
    {
      "Name": "Chidambaram Raghavan",
      "Batch": "1968",
      "Email": "craghavan@gmail.com",
      "Phone": "2063048828",
      "Country_Code": "1",
      "device_id": "79490fa9-86d5-409f-acf6-8635fa71f28c"
    },
    {
      "Name": "Prabhakar Krishnaswami",
      "Batch": "1968",
      "Email": "pkrishnaswami@hotmail.com",
      "Phone": "8018367814",
      "Country_Code": "1",
      "device_id": "ecfbf0e0-5183-47a9-8200-dbbd052f5e0a"
    },
    {
      "Name": "Anand Jagannathanb",
      "Batch": "1968",
      "Email": "anand@jagannathan.us",
      "Phone": "4082307252",
      "Country_Code": "1",
      "device_id": "52ac5f09-1e91-40dd-9a93-dd95a0a804f9"
    },
    {
      "Name": "Subramaniam Krishnan",
      "Batch": "1968",
      "Email": "skrish5201@yahoo.com",
      "Phone": "7039669257",
      "Country_Code": "1",
      "device_id": "c252344d-61df-42df-9220-d95cbb340ea1"
    },
    {
      "Name": "Mahadevan Gopal Krishnan",
      "Batch": "1968",
      "Email": " mkris@aol.com",
      "Phone": "7325807508",
      "Country_Code": "1",
      "device_id": "c2c324a7-ff3d-4501-90cf-a998dd37f102"
    },
    {
      "Name": "Ravinder Joseph",
      "Batch": "1968",
      "Email": "ravij2019@hotmail.com",
      "Phone": "5129633200",
      "Country_Code": "1",
      "device_id": "15ec00d6-dc13-4530-be20-5d00c847475c"
    },
    {
      "Name": "Anand Balaram",
      "Batch": "1968",
      "Email": " steadybalu@aol.com",
      "Phone": "4083937221",
      "Country_Code": "1",
      "device_id": "2e27724f-313d-4eee-8aa9-cdc6625a805d"
    },
    {
      "Name": "Jayaraman Vijayakumar",
      "Batch": "1969",
      "Email": "vjvijayak@gmail.com",
      "Phone": "8044750304",
      "Country_Code": "1",
      "device_id": "aaf99947-2749-4c85-8240-24f85092a247"
    },
    {
      "Name": "Ravi Chandar",
      "Batch": "1969",
      "Email": "chandar_ravi@hotmail.com",
      "Phone": "9452161750",
      "Country_Code": "1",
      "device_id": "25e441ad-ea25-4fde-8fc4-b39063205c5c"
    },
    {
      "Name": "Abdul Allam",
      "Batch": "1969",
      "Email": "abdul.allam9@gmail.com",
      "Phone": "9192471113",
      "Country_Code": "1",
      "device_id": "6be88626-af7c-4001-9f81-db1d58390f6d"
    },
    {
      "Name": "Narayan Krishnan",
      "Batch": "1969",
      "Email": "peekayn54@gmail.com",
      "Phone": "4082180679",
      "Country_Code": "1",
      "device_id": "0d1d92bc-df97-4cd4-b8a1-e4625ffd0aa8"
    },
    {
      "Name": "Hari Hariharan",
      "Batch": "1970",
      "Email": "hariharanneel@gmail.com",
      "Phone": "6469203589",
      "Country_Code": "1",
      "device_id": "86b67b4c-c4f0-4f9f-b866-a312a4f3f957"
    },
    {
      "Name": "Bagavan Sundaram",
      "Batch": "1971",
      "Email": "sunb005@gmail.com",
      "Phone": "9196223691",
      "Country_Code": "1",
      "device_id": "9b299bbc-2917-480b-bfa1-06a9290d32b0"
    },
    {
      "Name": "Girish Shah",
      "Batch": "1971",
      "Email": "girishshah6456@yahoo.com",
      "Phone": "5625337319",
      "Country_Code": "1",
      "device_id": "14c6b4f7-1943-4a02-ba9f-1cbb5395712e"
    },
    {
      "Name": "Nandakumar Vellasamy",
      "Batch": "1980",
      "Email": "vellasamyn1@verizon.net",
      "Phone": "4432550983",
      "Country_Code": "1",
      "device_id": "eba061f4-537c-4dad-af1b-4238559dce08"
    },
    {
      "Name": "Tarun Inuganti",
      "Batch": "1981",
      "Email": "tinuganti@gmail.com",
      "Phone": "3103469580",
      "Country_Code": "1",
      "device_id": "521ac83c-11d8-4cbb-ae30-95a97ff9f68d"
    },
    {
      "Name": "Ashok Ramaswami",
      "Batch": "1981",
      "Email": "aramaswami@gmail.com",
      "Phone": "4152905030",
      "Country_Code": "1",
      "device_id": "ae9c1fc7-ab25-4211-98fc-426c22580db3"
    },
    {
      "Name": "JUDY JOSEPH",
      "Batch": "1981",
      "Email": "ecdoc@yahoo.com",
      "Phone": "8479624044",
      "Country_Code": "1",
      "device_id": "6818f79a-d5e2-4628-9be2-3ca5c57edd33"
    },
    {
      "Name": "Kannan Solayappan",
      "Batch": "1982",
      "Email": "ksolay@gmail.com",
      "Phone": "7637724327",
      "Country_Code": "1",
      "device_id": "50a0900b-28cf-4ba0-9450-4646c353f89b"
    },
    {
      "Name": "Mark Mascarenhas",
      "Batch": "1982",
      "Email": "mmascar@comcast.net",
      "Phone": "8323961037",
      "Country_Code": "1",
      "device_id": "f3544268-6cb3-485e-b4dc-07cfd9422b5b"
    },
    {
      "Name": "Mark Mascarenhas",
      "Batch": "1982",
      "Email": "mmascar@comcast.net",
      "Phone": "8323961037",
      "Country_Code": "1",
      "device_id": "15f20504-ce0a-4be6-b6d5-6c7e6338bdb1"
    },
    {
      "Name": "Simon Paul",
      "Batch": "1983",
      "Email": "spaulaim@gmail.com",
      "Phone": "5209790304",
      "Country_Code": "1",
      "device_id": "59169b94-05e2-4ec9-9140-1895c3bd1746"
    },
    {
      "Name": "Srinath Unnikrishnan",
      "Batch": "1983",
      "Email": "sunnikri@gmail.com",
      "Phone": "4089811424",
      "Country_Code": "1",
      "device_id": "98b6f831-2e21-4117-aac3-1bcf42e5b24a"
    },
    {
      "Name": "Srinivasa Rao",
      "Batch": "1983",
      "Email": "kgsrini@gmail.com",
      "Phone": "9364049636",
      "Country_Code": "1",
      "device_id": "1357d64e-0f38-475a-8d1c-e195e3709d8f"
    },
    {
      "Name": "Vijay Nathan",
      "Batch": "1983",
      "Email": "vijaylnathan@gmail.com",
      "Phone": "7322130980",
      "Country_Code": "1",
      "device_id": "05b706f4-0b41-4916-ab90-14c56deacc61"
    },
    {
      "Name": "Ranjit Rajamani",
      "Batch": "1983",
      "Email": "ranjitrajamani@hotmail.com",
      "Phone": "7814348851",
      "Country_Code": "1",
      "device_id": "c9e2f716-6128-494e-8532-2cb69163cbc3"
    },
    {
      "Name": "Girish Balachandran",
      "Batch": "1983",
      "Email": "girish2617@gmail.com",
      "Phone": "4086903117",
      "Country_Code": "1",
      "device_id": "ee32b7c9-15ed-4cf4-aad2-6b35df2ffb01"
    },
    {
      "Name": "Vinu Alexander",
      "Batch": "1985",
      "Email": "vinualexander@gmail.com",
      "Phone": "5052400883",
      "Country_Code": "1",
      "device_id": "b22c42e4-463e-4c84-a9a9-7d94d0bf76e5"
    },
    {
      "Name": "Dinesh Dulipsingh",
      "Batch": "1985",
      "Email": "dinesh@lexingtonsoft.com",
      "Phone": "7816328252",
      "Country_Code": "1",
      "device_id": "051b87c5-9406-4fae-80b1-4c87d777a9da"
    },
    {
      "Name": "Silvester Motha",
      "Batch": "1985",
      "Email": "silvinp@hotmail.com",
      "Phone": "9199955213",
      "Country_Code": "1",
      "device_id": "c89702a5-4ef6-4399-a460-d12df0201e92"
    },
    {
      "Name": "Sid Ramachandran",
      "Batch": "1985",
      "Email": "sid.ramachandran@gmail.com",
      "Phone": "5038041354",
      "Country_Code": "1",
      "device_id": "de85ef26-9133-43e6-a75a-aaf1e029d46a"
    },
    {
      "Name": "Raghu Raman Mani",
      "Batch": "1985",
      "Email": "raghuradyar@hotmail.com",
      "Phone": "7711881782",
      "Country_Code": "44",
      "device_id": "a666b53c-6d09-4514-b3b2-e4721fda94ff"
    },
    {
      "Name": "Kash Rangan",
      "Batch": "1985",
      "Email": "kash.rangan@gmail.com",
      "Phone": "4156761285",
      "Country_Code": "1",
      "device_id": "e2b995ba-c9a5-42e2-a056-9d0ed721bafa"
    },
    {
      "Name": "Yatheendhar Manicka",
      "Batch": "1985",
      "Email": "ymanicka@msn.com",
      "Phone": "4082188949",
      "Country_Code": "1",
      "device_id": "1da7f93d-64bf-4292-aa88-b559b18c1673"
    },
    {
      "Name": "Sanjay A Thomas",
      "Batch": "1985",
      "Email": "sanjaythomas@yahoo.com",
      "Phone": "3122863511",
      "Country_Code": "1",
      "device_id": "c0c4c00d-8e71-4bf9-9b91-ca165752f0d0"
    },
    {
      "Name": "Naveen Irudayaraj",
      "Batch": "1986",
      "Email": "naveen@enpowertek.com",
      "Phone": "9473315335",
      "Country_Code": "1",
      "device_id": "7b48f9dd-ada7-4b00-a2f1-dd49766e7db9"
    },
    {
      "Name": "Satish Seshayya",
      "Batch": "1986",
      "Email": "sseshayya@gmail.com",
      "Phone": "9729044499",
      "Country_Code": "1",
      "device_id": "4f218a58-1fc6-4f2a-9735-6030e53999fd"
    },
    {
      "Name": "Murali Murugesan",
      "Batch": "1987",
      "Email": "murali.murugesan@gmail.com",
      "Phone": "5103789931",
      "Country_Code": "1",
      "device_id": "20ae5562-876f-453e-9da6-365580e42739"
    },
    {
      "Name": "Aravindan Sankaramurthy",
      "Batch": "1987",
      "Email": "aravindan_s@yahoo.com",
      "Phone": "6503032865",
      "Country_Code": "1",
      "device_id": "413f4d5c-183b-4c3e-a186-c393e605862f-3b1a-4253-bc86-59db48be945e"
    },
    {
      "Name": "Surendhar Manicka",
      "Batch": "1987",
      "Email": "smanicka@yahoo.com",
      "Phone": "7036086774",
      "Country_Code": "1",
      "device_id": "815f4459-faff-4da5-a981-4b58f8dd5155"
    },
    {
      "Name": "Shanker Kuttath",
      "Batch": "1987",
      "Email": "shanker_kuttath22@gmail.com",
      "Phone": "5126631573",
      "Country_Code": "1",
      "device_id": "a8bc5dce-1953-472c-a59e-358389256a58"
    },
    {
      "Name": "Jithendra Vummidi",
      "Batch": "1987",
      "Email": "jithvummidi1@gmail.com",
      "Phone": "9841014014",
      "Country_Code": "91",
      "device_id": "6114949c-8f84-4a18-81b8-cd29518f0083"
    },
    {
      "Name": "Sathya Choodamani",
      "Batch": "1987",
      "Email": "sathya.choodamani@gmail.com",
      "Phone": "9048145150",
      "Country_Code": "1",
      "device_id": "093924d6-1cfb-4772-928f-46fe4ab1ae22"
    },
    {
      "Name": "Christopher Williams",
      "Batch": "1987",
      "Email": "swccapc@gmail.com",
      "Phone": "5595458465",
      "Country_Code": "1",
      "device_id": "2e6dbdfb-4241-43d3-839a-6ba3503e9678"
    },
    {
      "Name": "Sundar Nathan",
      "Batch": "1987",
      "Email": "sundarwrites@gmail.com",
      "Phone": "4153595977",
      "Country_Code": "1",
      "device_id": "5d1dad40-b8dd-4d77-972a-2dd9efefea8b"
    },
    {
      "Name": "Ajit Kurien Tharakan",
      "Batch": "1988",
      "Email": "akurient@hotmail.com",
      "Phone": "5738149350",
      "Country_Code": "1",
      "device_id": "741482ae-e8d2-419c-a6f7-59ed1364bf07"
    },
    {
      "Name": "Dr Satish THIRUMALAI",
      "Batch": "1988",
      "Email": "drsatish1@gmail.com",
      "Phone": "7184400788",
      "Country_Code": "1",
      "device_id": "c6ece123-4cc2-472c-84a3-12d2e7afd7b3"
    },
    {
      "Name": "Rajesh Paul",
      "Batch": "1988",
      "Email": "rajeshspaul@hotmail.com",
      "Phone": "2486869755",
      "Country_Code": "1",
      "device_id": "577dd753-4deb-4818-b5e1-b43f58ae8040"
    },
    {
      "Name": "Satish Cherian",
      "Batch": "1988",
      "Email": "satishcherian11@gmail.com",
      "Phone": "3126221197",
      "Country_Code": "1",
      "device_id": "ad1bdf0c-8b46-4dd3-ab3d-8b53541dec25"
    },
    {
      "Name": "Siddharth Chandramouli",
      "Batch": "1988",
      "Email": "siddharth.chandramouli@gmail.com",
      "Phone": "734395 3673",
      "Country_Code": "1",
      "device_id": "97c56ec4-a3ea-4c31-9e3d-73fc0b931f80"
    },
    {
      "Name": "Mathew Vachaparampil",
      "Batch": "1988",
      "Email": "mathewv@caresoftglobal.com",
      "Phone": "8472090599",
      "Country_Code": "1",
      "device_id": "a3568d6c-8fc7-4ace-90d5-3a7ba8732b71"
    },
    {
      "Name": "Narayan Sethuramon",
      "Batch": "1988",
      "Email": "narayans4771@gmail.com",
      "Phone": "9840847710",
      "Country_Code": "91",
      "device_id": "c2dda1a5-d676-4b6b-b82f-dfcb27c9b436"
    },
    {
      "Name": "Hubert A Jerome",
      "Batch": "1988",
      "Email": "hjerome@gmail.com",
      "Phone": "8587505686",
      "Country_Code": "1",
      "device_id": "6d136707-49e9-4245-b7ac-44c4f9b3ac78"
    },
    {
      "Name": "SARVANAN TIRRNAV",
      "Batch": "1988",
      "Email": "SARVANAN.TIRRNAV@GMAIL.COM",
      "Phone": "9727686131",
      "Country_Code": "1",
      "device_id": "b583d335-c0eb-4dbf-864a-09cebec06592"
    },
    {
      "Name": "Arun Kavunder",
      "Batch": "1988",
      "Email": "raja.arun@gmail.com",
      "Phone": "8178962027",
      "Country_Code": "1",
      "device_id": "109b11a4-f1fd-44e5-bd6d-d8b77f4cb904"
    },
    {
      "Name": "Chegu Vinod (Vinod)",
      "Batch": "1988",
      "Email": "vinodchegu@gmail.com",
      "Phone": "4087612464",
      "Country_Code": "1",
      "device_id": "61ca41ab-fde0-43e9-8d98-2ccd4b7189cb"
    },
    {
      "Name": "Sujit Tharakan",
      "Batch": "1990",
      "Email": "sujitjacobtharakan@gmail.com",
      "Phone": "9940669471",
      "Country_Code": "1",
      "device_id": "c1a937a9-ade0-4a1e-b807-1d604a421a7b"
    },
    {
      "Name": "Vinod Rodrigo",
      "Batch": "1990",
      "Email": "vinod.rodrigo@gmail.com",
      "Phone": "7737447368",
      "Country_Code": "1",
      "device_id": "38bf68a9-ff4f-4196-be84-18c1566f4071"
    },
    {
      "Name": "Aravind Seshadri",
      "Batch": "1990",
      "Email": "seshadri.aravind@gmail.com",
      "Phone": "5714350628",
      "Country_Code": "1",
      "device_id": "234a78fa-0465-420f-9805-16f438e0c071"
    },
    {
      "Name": "Japheth Prakash",
      "Batch": "1990",
      "Email": "japh55@yahoo.com",
      "Phone": "5029911235",
      "Country_Code": "1",
      "device_id": "d67f2a34-a548-4636-ba74-217cf15bfdf7"
    },
    {
      "Name": "Vijai A Sundaram",
      "Batch": "1990",
      "Email": "vjsund@gmail.com",
      "Phone": "2024151379",
      "Country_Code": "1",
      "device_id": "109874b4-b6b4-410f-a51b-ba194f2a5eed"
    },
    {
      "Name": "Charles Mopur",
      "Batch": "1990",
      "Email": "charlesmopur@gmail.com",
      "Phone": "9169520185",
      "Country_Code": "1",
      "device_id": "4b396e10-53d5-402b-b2a0-7d9cab2e8007"
    },
    {
      "Name": "Balaji Dakshinamurthy",
      "Batch": "1990",
      "Email": "dbalaji@hotmail.com",
      "Phone": "5713524445",
      "Country_Code": "1",
      "device_id": "24ec5255-477e-4a1d-b7c1-311ef9a9828c"
    },
    {
      "Name": "Venkatesan Muthukumar",
      "Batch": "1990",
      "Email": "vm@unlv.nevada.edu",
      "Phone": "7024163850",
      "Country_Code": "1",
      "device_id": "9c824f84-06cb-436b-a8e1-8b3bec231ec4"
    },
    {
      "Name": "RAJA GOPALAN B",
      "Batch": "1990",
      "Email": "rajab28@gmail.com",
      "Phone": "9840087857",
      "Country_Code": "91",
      "device_id": "3b9092eb-1bfd-4f98-9de3-2669353920cd"
    },
    {
      "Name": "Preetam Basil",
      "Batch": "1990",
      "Email": "preetambasil@gmail.com",
      "Phone": "2039138888",
      "Country_Code": "1",
      "device_id": "20700130-c082-4cc6-9516-2e5e89f8339e"
    },
    {
      "Name": "Arindam Basu",
      "Batch": "1991",
      "Email": "arindam0130@yahoo.com",
      "Phone": "4255032474",
      "Country_Code": "1",
      "device_id": "cc5b1db3-8967-42f3-add8-7220406f2f82"
    },
    {
      "Name": "Krishnan Ramanathan",
      "Batch": "1991",
      "Email": "krishnan100018831@gmail.com",
      "Phone": "7275185942",
      "Country_Code": "1",
      "device_id": "905473b3-effc-4d8e-8d39-4b131e703dbe"
    },
    {
      "Name": "Naveen Bandla",
      "Batch": "1992",
      "Email": "naveenbandla.us@gmail.com",
      "Phone": "9723658842",
      "Country_Code": "1",
      "device_id": "8c8a008f-bf9e-4081-ae2c-575a07f15465 "
    },
    {
      "Name": "Joe Mahimainathan",
      "Batch": "1994",
      "Email": "joe4dec@yahoo.com",
      "Phone": "9176221283",
      "Country_Code": "1",
      "device_id": "4b667367-2c08-473f-89bc-0b9f4facfc9f "
    },
    {
      "Name": "Arvind Vel",
      "Batch": "1994",
      "Email": "arvind.vel@gmail.com",
      "Phone": "4088351340",
      "Country_Code": "1",
      "device_id": "5c9ba226-c2e7-44cf-abc1-069d0fbd5a1f"
    },
    {
      "Name": "Fabian J David",
      "Batch": "1994",
      "Email": "fabian.j.david@gmail.com",
      "Phone": "9194149839",
      "Country_Code": "1",
      "device_id": "a8adebdf-61d2-4f09-948f-c6fea3e3facc"
    },
    {
      "Name": "Harish Thiagaraj",
      "Batch": "1994",
      "Email": "HTHIAGARAJ@GMAIL.COM",
      "Phone": "3606088560",
      "Country_Code": "1",
      "device_id": "82961990-c9b6-44b7-98da-3e9e68b166b6"
    },
    {
      "Name": "Mukund Madanagopal",
      "Batch": "1996",
      "Email": "grad.accountant@gmail.com",
      "Phone": "5108386269",
      "Country_Code": "1",
      "device_id": "25bfa01e-75a9-4279-ad20-7cf44dddd386"
    },
    {
      "Name": "Sunil Shanker",
      "Batch": "1996",
      "Email": "sshanker@gmail.com",
      "Phone": "5108470128",
      "Country_Code": "1",
      "device_id": "fe0f4d5b-f90e-4a72-81cc-5d44a06f5048"
    },
    {
      "Name": "Dhruva Krishna",
      "Batch": "1996",
      "Email": "dhruva.krishna@gmail.com",
      "Phone": "2534682475",
      "Country_Code": "1",
      "device_id": "75276944-a2c3-4bd1-ace3-ca6030fced1c"
    },
    {
      "Name": "Balu Sudhakar",
      "Batch": "1996",
      "Email": "balumenon@gmail.com",
      "Phone": "3176520613",
      "Country_Code": "1",
      "device_id": "3e8ad49b-ed0f-4510-96c5-c321ae2d498c"
    },
    {
      "Name": "Sayee Rajamany",
      "Batch": "1996",
      "Email": "sayee.rajamany@gmail.com",
      "Phone": "7033409332",
      "Country_Code": "1",
      "device_id": "85251fe5-feb7-4066-8691-f94b6b20d923"
    },
    {
      "Name": "Srijit Sivaraman",
      "Batch": "1996",
      "Email": "srijitsivaraman@gmail.com",
      "Phone": "8172477819",
      "Country_Code": "1",
      "device_id": "ccf5a8de-008a-46f3-99e3-f4625a990461"
    },
    {
      "Name": "Srinivas Sundaragopal",
      "Batch": "1997",
      "Email": "srini.sundar@gmail.com",
      "Phone": "7162282411",
      "Country_Code": "1",
      "device_id": "95890b4b-73ac-41e5-be91-5d472cf710d5"
    },
    {
      "Name": "Sukhin Srinivas",
      "Batch": "1997",
      "Email": "sukhin@gmail.com",
      "Phone": "6463309471",
      "Country_Code": "1",
      "device_id": "46eff287-bd58-4bcb-8d9e-3ca04bcb241b"
    },
    {
      "Name": "Prahlad Krishna",
      "Batch": "1997",
      "Email": "prahladpp@hotmail.com",
      "Phone": "5413013396",
      "Country_Code": "1",
      "device_id": "3b462a04-8ef6-4a1a-b5d8-072091bbaff1"
    },
    {
      "Name": "Sachin Verghese",
      "Batch": "1997",
      "Email": "verghese.sachin@gmail.com",
      "Phone": "8144414192",
      "Country_Code": "1",
      "device_id": "8a43e85b-b361-44e6-9928-28f4a99efea1"
    },
    {
      "Name": "Karthik Swaminathan",
      "Batch": "1997",
      "Email": "karthiksmail@gmail.com",
      "Phone": "8646503969",
      "Country_Code": "1",
      "device_id": "afa5fb55-3a07-4983-8ee0-8e5a5cb4d96f"
    },
    {
      "Name": "Vinay Bandla",
      "Batch": "1997",
      "Email": "vinaybandla@gmail.com",
      "Phone": "7187249338",
      "Country_Code": "1",
      "device_id": "4a3968cc-a86e-40a4-9ea9-b055d5fa750e"
    },
    {
      "Name": "Anthony Vijay Prakash",
      "Batch": "1997",
      "Email": "anthony.prakash@gmail.com",
      "Phone": "507401 6239",
      "Country_Code": "1",
      "device_id": "8e4e1c89-cdd6-4bff-af94-f990752c1922"
    },
    {
      "Name": "Karthik Chidambaram",
      "Batch": "1997",
      "Email": "chatwithKC@outlook.com",
      "Phone": "6506669565",
      "Country_Code": "1",
      "device_id": "db174260-6e73-4047-b025-4226c973d619"
    },
    {
      "Name": "Samvith Srinivas",
      "Batch": "1998",
      "Email": "samvith@gmail.com",
      "Phone": "6465733923",
      "Country_Code": "1",
      "device_id": "b34272b0-3199-4fd9-946c-7bc3cab426b3"
    },
    {
      "Name": "Avinash Arun",
      "Batch": "1998",
      "Email": "avi.arun@gmail.com",
      "Phone": "9737357788",
      "Country_Code": "1",
      "device_id": "5d6268d5-6431-475b-b427-de73e5378cf4"
    },
    {
      "Name": "Jeevan Moses",
      "Batch": "2000",
      "Email": "jeevanmosesg@gmail.com",
      "Phone": "8325660666",
      "Country_Code": "1",
      "device_id": "fee13408-9bf0-4a06-b9f3-0987b58e067b"
    },
    {
      "Name": "Francis Rajiv Prasad Fernando",
      "Batch": "2000",
      "Email": "francis.rajiv82@gmail.com",
      "Phone": "3474072440",
      "Country_Code": "1",
      "device_id": "7f29c213-3602-4c6f-8097-b652b89b87c9"
    },
    {
      "Name": "Reuben Rajkumar",
      "Batch": "2000",
      "Email": "reubenraws@gmail.com",
      "Phone": "8183192497",
      "Country_Code": "1",
      "device_id": "392a94e5-ffd3-4918-9e36-302225676981"
    },
    {
      "Name": "Richard Shervin Lendel",
      "Batch": "2001",
      "Email": "shervinlendl@yahoo.com",
      "Phone": "2017242328",
      "Country_Code": "1",
      "device_id": "093924d6-1cfb-4772-928f-46fe4ab1ae22"
    },
    {
      "Name": "Anderson S V",
      "Batch": "2009",
      "Email": "s.v.anderson1992@gmail.com",
      "Phone": "6477631346",
      "Country_Code": "1",
      "device_id": "b5edc9df-3b1a-4253-bc86-59db48be945e"
    },
    {
      "Name": "Chethan P",
      "Batch": "2010",
      "Email": "p.chethan.kawad@gmail.com",
      "Phone": "7346648256",
      "Country_Code": "1",
      "device_id": "33874aa3-625c-4be3-b74b-febbc1491391"
    },
    {
      "Name": "Mithru Vigneshwara S",
      "Batch": "2010",
      "Email": "mithru27@gmail.com",
      "Phone": "9292673123",
      "Country_Code": "1",
      "device_id": "a09728dd-cfee-4c04-be6e-b1daed37db60"
    },
    {
      "Name": "Sasha Mohan",
      "Batch": "2014",
      "Email": "sasha.mohan@gmail.com",
      "Phone": "5857094419",
      "Country_Code": "1",
      "device_id": "febfca9e-3664-49c0-8e97-f6097af42d7b"
    }
   ];

   const generateBody = (data) =>  {
   const bodyArray = data?.map((record)=>{
        const body = {
            "templateId": 1,
            "deviceUid": record?.device_id,
            "profileName": "Work",
            "email":record?.Email,
            "emailIds": [
              {
                "emailIdNumber": null,
                "emailId": record?.Email,
                "emailType": "work",
                "checkBoxStatus": true,
                "activeStatus": true
              }
            ],
            "websites": [],
            "socialMediaNames": [],
            "digitalPaymentLinks": [],
            "firstName": record?.Name,
            "lastName": "",
            "companyName": "",
            "phoneNumbers": [
              {
                "phoneNumberId": null,
                "countryCode": `+${record?.Country_Code}`,
                "phoneNumber": record?.Phone,
                "phoneNumberType": "",
                "checkBoxStatus": true,
                "activeStatus": true
              }
            ]
          };
        return body;
    });
    
    return bodyArray;
   };

   const test = [    {
    "Name": "ShekharSingh",
    "Batch": "2010",
    "Email": "sshekharsingh@gmail.com",
    "Phone": "9292671234",
    "Country_Code": "1",
    "device_id": "2fc65286-8916-44ad-88a2-0dc27a384f80"
  },
  {
    "Name": "ponah",
    "Batch": "2014",
    "Email": "ponah83229@paxnw.com",
    "Phone": "5857094419",
    "Country_Code": "1",
    "device_id": "fc7d319c-e5e1-405e-b18b-5fe92dbf0ade"
  }
 ];

const data = generateBody(test);

console.log(JSON.stringify(data, null, 2));

//    const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

//    const data = generateBody(profileData);

//    const dataAsString = JSON.stringify(data, null, 2); // Converts to a formatted JSON string

//    // Resolve the path to create the file in the same folder
//    const filePath = path.resolve(__dirname, "new.js");
   
//    // Write data to the new.js file
//    try {
//      await writeFile(filePath, dataAsString); // Write the JSON string to the file
//      console.log("File created successfully with the data!");
//    } catch (err) {
//      console.error("Error writing to file:", err);
//    }