import fetch from "node-fetch";

//Eagele API服务与Eagle软件一起启动，https://api.eagle.cool/item/list
//仅操作当前打开的文件库

interface Palette {
    color: [number, number, number];
    ratio: number;
}

export interface EagleItem {
    id: string;
    name: string;
    size: number;
    ext: string;
    tags: string[];
    folders: string[];
    isDeleted: boolean;
    url: string;
    annotation: string;
    modificationTime: number;
    height: number;
    width: number;
    lastModified: number;
    palettes: Palette[];
    filePath: string; //raletive path 'images/123.info'  in Eagle library 
    fileName: string; // name+ext
}

interface EagleQueryOptions {
    name?: string;
    ext?: string;
    folders?: string;
    tags?: string;
    orderBy?: string;
    limit?: number;
    offset?: number;
}

const EAGLE_BASE_URL = "http://localhost:41595/api";

export async function searchEagleItems(options: EagleQueryOptions): Promise<EagleItem[]> {
    const params = new URLSearchParams();

    if (options.name) params.append("name", options.name);
    if (options.ext) params.append("ext", options.ext);
    if (options.folders) params.append("folders", options.folders);
    if (options.tags) params.append("tags", options.tags);
    if (options.orderBy) params.append("orderBy", options.orderBy);

    //The number of items to be displayed. the default number is 200  in Eagle
    //cancel the default value 
    let limit = options.limit ? options.limit?.toString() : String(99999999999)
    params.append("limit", limit);

    if (options.offset) params.append("offset", options.offset?.toString() || "0");

    const url = `${EAGLE_BASE_URL}/item/list?${params.toString()}`;

    const response = await fetch(url, { method: "GET", redirect: "follow" });
    if (!response.ok) {
        throw new Error(`Eagle API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== "success") {
        throw new Error(`Eagle API returned error status: ${data.status}`);
    }

    return data.data as EagleItem[] || [];
}


// Eagle Library Information 
interface EagleFolder {
    id: string;
    name: string;
    description: string;
    children: EagleFolder[];
    modificationTime: number;
    tags?: string[];
    iconColor?: string;
    password?: string;
    passwordTips?: string;
    coverId?: string;
    orderBy?: string;
    sortIncrease?: boolean;
    icon?: string;
}

interface EagleSmartFolder {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    modificationTime: number;
    conditions: any[];
    orderBy?: string;
    sortIncrease?: boolean;
}

interface EagleTagGroup {
    id: string;
    name: string;
    tags: string[];
    color?: string;
}

interface EagleLibraryData {
    folders: EagleFolder[];
    smartFolders: EagleSmartFolder[];
    quickAccess: any[];
    tagsGroups: EagleTagGroup[];
    modificationTime: number;
    applicationVersion: string;
}

interface EagleLibraryResponse {
    status: string;
    data: EagleLibraryData;
}

export async function getEagleLibraryInfo(): Promise<EagleLibraryData> {
    const url = "http://localhost:41595/api/library/info";

    const response = await fetch(url, { method: "GET", redirect: "follow" });
    if (!response.ok) {
        throw new Error(`Eagle API request failed: ${response.status} ${response.statusText}`);
    }

    const result: EagleLibraryResponse = await response.json();

    if (result.status !== "success") {
        throw new Error(`Eagle API returned error status: ${result.status}`);
    }

    return result.data;
}





async function getItemsByFolderIds(folderIds: string[]): Promise<EagleItem[]> {
    const results: EagleItem[] = [];
    try {
        for (const id of folderIds) {
            const items = await searchEagleItems({
                folders: id,
            });
            console.log(`FolderID: ${id},${items.length}`)
            const processed = items.map(item => ({
                ...item,
                filePath: `/images/${item.id}.info`,
                fileName: item.name + "." + item.ext
            }));
            results.push(...processed);
        }
    } catch(err) {
        console.error(err)
    }
    return results;
}

/**
 * find all items of path(includes subpaths)
 * @param path fullPath "/vincent/collections/"
 */
export async function getAllItemsOfPath(path: string): Promise<EagleItem[]> {
    const data = await getEagleLibraryInfo()
    const folders = data.folders as EagleFolder[];
    const pathParts = path.split("/").filter(Boolean); // '/a/b/' → ['a','b']
    const targetFolder = findFolderByPath(folders, pathParts);
    if (!targetFolder) throw new Error(`Cannot find this path: ${path}`);

    const folderIds = getAllFolderIds(targetFolder);
    return await getItemsByFolderIds(folderIds);
}

/** Recursively find the folder corresponding to the path */
function findFolderByPath(folders: EagleFolder[], pathParts: string[]): EagleFolder | null {
    if (pathParts.length === 0) return null;
    const [head, ...rest] = pathParts; //  ['a','b','c'] → head='a' rest=['b','c']
    const folder = folders.find(f => f.name === head);
    if (!folder) return null;
    if (rest.length === 0) return folder;//search end.
    return findFolderByPath(folder.children, rest);
}

/** find all subPaths of a path */
function getAllFolderIds(folder: EagleFolder): string[] {
    let ids = [folder.id];
    for (const child of folder.children) {
        ids = ids.concat(getAllFolderIds(child));
    }
    return ids;
}

