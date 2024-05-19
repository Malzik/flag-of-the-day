export interface Flag {
    name: string;
    image: string;
}

export interface Player {
    id: string;
    streak: string;
}

export interface History {
    result: string;
    date: string;
    points: number;
    flags: { flag: string, tries: number}[];
}
