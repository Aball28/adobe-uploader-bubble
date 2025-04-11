const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Uploader service is live!");
});

app.post("/upload-to-adobe", async (req, res) => {
  const { bubbleFileUrl, adobeUploadUri } = req.body;

  if (!bubbleFileUrl || !adobeUploadUri) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    const fileResponse = await axios.get(bubbleFileUrl, {
      responseType: "arraybuffer",
    });

    const adobeResponse = await axios.put(adobeUploadUri, fileResponse.data, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": fileResponse.headers["content-length"],
      },
    });

    if (adobeResponse.status === 200) {
      return res.json({ message: "File uploaded to Adobe successfully" });
    } else {
      return res.status(500).json({ error: "Upload failed", adobeResponse });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Uploader service running on port ${PORT}`);
});
