import { ArtworkImage, ArtworkImageDao } from "./ArtworkImageDAO.js";

async function main() {
    const images: ArtworkImage[] = [{
        artworkId: 123,
        artworkCode: "ART123",
        imgSpec: "small",
        ext: "jpg",
        qualityRating: "high",
        source: "photographer",
        cosUrl: "https://your-cos-url.com/image.jpg",
        widthPx: 800,
        heightPx: 600,
        fileSizeBytes: 102400
    },{
        artworkId: 123,
        artworkCode: "ART123",
        imgSpec: "large",
        ext: "jpg",
        qualityRating: "high",
        source: "photographer",
        cosUrl: "https://your-cos-url.com/image.jpg",
        widthPx: 800,
        heightPx: 600,
        fileSizeBytes: 102400
    }];

    try {
        const dao = new ArtworkImageDao();
        const id = dao.insertMany(images);
        console.log("Inserted row id:", id);
    } catch (err: any) {
        console.error("SQLite insert error:", err);
    }
}

main();
