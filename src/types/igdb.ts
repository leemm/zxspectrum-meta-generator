export interface IGDB {
    platformIds?: Platform[];
    clientId: string;
    clientSecret: string;
    accessToken?: string;
}

export interface Platform {
    id: number;
    name: string;
}

export interface Game {
    id: number;
    name: string;
    summary?: string;
    storyline?: string;
}

export interface TokenReponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}
