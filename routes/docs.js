const express = require("express");
const Minio = require("minio");
const { PDFNet } = require("@pdftron/pdfnet-node");
const Jimp = require("jimp");
const fs = require("fs");

const minioClient = new Minio.Client({
  endPoint: "172.30.10.196",
  port: 9000,
  useSSL: false,

  accessKey: "minioadmin",
  secretKey: "minioadmin",
});

const router = express.Router();

router.post("/", async function (req, res, next) {
  let uploadFile = req.files.file;

  async function main() {
    try {
      const doc = await PDFNet.PDFDoc.createFromUFilePath(
        uploadFile.tempFilePath
      );
      await doc.initSecurityHandler();

      const pdfDraw = await PDFNet.PDFDraw.create(92);
      const currPage = await doc.getPage(1);
      await pdfDraw.export(currPage, "/tmp/assets/test.png", "PNG");

      const image = await Jimp.read("/tmp/assets/test.png");

      await image
        .blur(7, function (err) {
          if (err) throw err;
        })
        .writeAsync("/tmp/assets/blur.jpg");
    } catch (e) {
      console.log(e);
    }
  }

  await PDFNet.runWithCleanup(
    main,
    "demo:1667203412870:7aacd2e903000000009bd41c47ae452920f1e15923babc90df40ad3c04"
  );

  // .catch(function (error) {
  //   console.log("Error: " + JSON.stringify(error));
  // })
  // .then(function () {
  //   PDFNet.shutdown();
  // });

  minioClient.makeBucket("pdf", "us-east-1", function (err) {
    if (err) return console.log(err);

    console.log('Bucket created successfully in "us-east-1".');

    var metaData = {
      "Content-Type": "application/pdf",
    };
    // Using fPutObject API upload your file to the bucket europetrip.
    minioClient.fPutObject(
      "pdf",
      "test123.pdf",
      file,
      metaData,
      function (err, etag) {
        if (err) return console.log(err);
        console.log("File uploaded successfully.");
      }
    );
  });
  var metaData = {
    "Content-Type": "application/pdf",
  };
  // Using fPutObject API upload your file to the bucket europetrip.
  minioClient.fPutObject(
    "pdf",
    uploadFile.name,
    uploadFile.tempFilePath,
    metaData,
    function (err, etag) {
      if (err) return console.log(err);
      console.log("File uploaded successfully.");
    }
  );

  const file = fs.readFileSync("/tmp/assets/blur.jpg");

  const submitFileDataResult = await minioClient
    .putObject("thumbnail", `${uploadFile.name}-thumbnail.jpg`, file)
    .catch((e) => {
      console.log("Error while creating object from file data: ", e);
      throw e;
    });

  console.log(submitFileDataResult);

  // minioClient.putObject(
  //   "thumbnail",
  //   `${uploadFile.name}-thumbnail.jpg`,
  //   "/tmp/assets/blur.jpg",
  //   {
  //     "Content-Type": "image/jpeg",
  //   },
  //   function (err, etag) {
  //     if (err) return console.log(err);
  //     console.log("File uploaded successfully.");
  //   }
  // );

  res.sendStatus(200);
});

module.exports = router;
