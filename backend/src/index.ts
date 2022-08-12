import pinataSDK from "@pinata/sdk";
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");
const express = require("express");

const app: any = express();
const upload = multer({ dest: "uploads/" });
const port = process.env.NODE_ENV === "production" ? process.env.PORT : 8080; // default port to listen
console.log("PORT", port);
let pinata: any;
if (process.env.NODE_ENV === "production") {
    pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_KEY);
} else {
    const PinataKeys = require("./PinataKeys").default;
    pinata = pinataSDK(PinataKeys.apiKey, PinataKeys.apiSecret);
}
const corsOptions = {
    credentials: true,
    origin: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(
    express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 })
);
app.use(function (req: any, res: any, next: any) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-  With, Content-Type, Accept");
    next();
});

app.get("/", (req: any, res: any) => {
    res.send("Hello developers!");
});

app.post("/mint", upload.single("image"), async (req: any, res: any) => {
    const multerReq = req as any;
    if (!multerReq.file) {
        res.status(500).json({ status: false, msg: "no file provided" });
    } else {
        const fileName = multerReq.file.filename;
        // tests Pinata authentication
        let test = await pinata
            .testAuthentication()
            .catch((err: any) => {
                res.status(500).json(JSON.stringify(err))
            });
        // creates readable stream
        const readableStreamForFile = fs.createReadStream(`./uploads/${fileName}`);
        const options: any = {
            pinataMetadata: {
                name: req.body.title.replace(/\s/g, "-"),
                keyvalues: {
                    description: req.body.description
                }
            }
        };
        const pinnedFile = await pinata.pinFileToIPFS(
            readableStreamForFile,
            options
        );
        if (pinnedFile.IpfsHash && pinnedFile.PinSize > 0) {
            // remove file from server
            fs.unlinkSync(`./uploads/${fileName}`);
            // pins metadata
            const metadata = {
                name: req.body.title,
                description: req.body.description,
                symbol: "ENER",
                artifactUri: `ipfs://${pinnedFile.IpfsHash}`,
                displayUri: `ipfs://${pinnedFile.IpfsHash}`,
                creators: [req.body.creator],
                decimals: 0,
                thumbnailUri: "https://tezostaquito.io/img/favicon.png",
                is_transferable: true,
                shouldPreferSymbol: false
            };

            const pinnedMetadata = await pinata.pinJSONToIPFS(metadata, {
                pinataMetadata: {
                    name: "ENER-metadata"
                }
            });

            if (pinnedMetadata.IpfsHash && pinnedMetadata.PinSize > 0) {
                res.status(200).json({
                    status: true,
                    msg: {
                        imageHash: pinnedFile.IpfsHash,
                        metadataHash: pinnedMetadata.IpfsHash
                    }
                });
            } else {
                res
                    .status(500)
                    .json({ status: false, msg: "metadata were not pinned" });
            }
        } else {
            res.status(500).json({ status: false, msg: "file was not pinned" });
        }
    }
});

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});