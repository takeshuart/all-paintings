// /src/services/vincentArtwork.ts

import { PrismaClient, VincentArtwork } from '@prisma/client';
import { prisma } from 'lib/prismaDB.js';

// const prisma = new PrismaClient();

export async function findArtworkById(id: number): Promise<VincentArtwork | null> {
    console.log(`正在查询 ID 为 ${id} 的艺术品...`);

    const artwork = await prisma.vincentArtwork.findUnique({
        where: {
            id: id,
        },
        include: {
            colorFeatures: true,
        },
    });

    return artwork;
}

interface FindAllParams {
    page: number;
    pageSize: number;
}

interface FindAllResult {
    artworks: VincentArtwork[];
    totalCount: number;
}

export async function findAllArtworks({ page, pageSize }: FindAllParams): Promise<FindAllResult> {
    const offset = (page - 1) * pageSize;
    
    console.log(`\n正在查询第 ${page} 页，每页 ${pageSize} 条记录 (跳过 ${offset} 条)...`);

    const [totalCount, artworks] = await prisma.$transaction([
        prisma.vincentArtwork.count(),
        
        prisma.vincentArtwork.findMany({
            orderBy: { id: 'desc' }, 
            
            skip: offset,
            take: pageSize,
        }),
    ]);

    return { artworks, totalCount };
}

async function runArtworkQueries() {
    try {
        const id=9220
        const singleArtwork = await findArtworkById(id); 
        if (singleArtwork) {
            console.log(`${singleArtwork.titleEn}`);
            console.log(`Color: ${!!singleArtwork.colorPalette}`);
        } else {
            console.log("Can't find Id:"+id);
        }

        const { artworks, totalCount } = await findAllArtworks({ page: 2, pageSize: 5 });
        
        console.log(`\n 总共 ${totalCount} 条记录。`);
        console.log("--- 第一页记录摘要 ---");
        
        artworks.forEach(a => {
            console.log(`ID: ${a.id}, Title: ${a.titleEn}`);
        });

    } catch (error) {
        console.error("\n💥 运行错误:", error);
    } finally {
        await prisma.$disconnect();
    }
}

async function userTest() {
    const user=prisma.user.findMany()
    console.log(user)
}

userTest()
// runArtworkQueries();