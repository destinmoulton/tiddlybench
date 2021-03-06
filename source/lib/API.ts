import superagent from "superagent";

import ConfigStorage from "./storage/ConfigStorage";
import { API_Result, ITiddlerItem, IFullTiddler } from "../types";
import { EConfigKey } from "../enums";
export const ENDPOINTS = {
    BASE: "/",
    GET_ALL: "/recipes/default/tiddlers.json",
    STATUS: "/status",
    PUT_TIDDLER: "/recipes/default/tiddlers/",
    GET_SINGLE_TIDDLER: "/recipes/default/tiddlers/",
};

class API {
    private configStorage: ConfigStorage;

    constructor(configStorage: ConfigStorage) {
        this.configStorage = configStorage;
        this.joinURL = this.joinURL.bind(this);
    }

    private joinURL(p1: string, p2: string) {
        p1 = p1.endsWith("/") ? p1.substr(0, p1.length - 1) : p1;
        p2 = p2.startsWith("/") ? p2.substr(1) : p2;

        return p1 + "/" + p2;
    }

    public async get(url: string): Promise<API_Result> {
        let response;
        const options = await this.configStorage.getAll();
        try {
            response = await superagent
                .get(url)
                .auth(
                    options[EConfigKey.SERVER_USERNAME],
                    options[EConfigKey.SERVER_PASSWORD]
                )
                .set("Accept", "application/json")
                .type("json");
            console.log("API :: get() :: response", response);
        } catch (err) {
            if (err.status === 401) {
                return {
                    ok: false,
                    status: err.status,
                    message: "The Username or Password is not valid.",
                };
            }
            return {
                ok: false,
                status: err.status,
                message:
                    "Failed to connect. Check the settings. Make sure you include http:// or https:// in the URL.",
            };
        }

        if (!response.ok) {
            return {
                ok: false,
                message:
                    "Failed to connect to that server. Check the URL. Make sure you include http:// or https://.",
                response,
            };
        }

        const data: ITiddlerItem[] = await response.body;

        return { ok: true, data };
    }

    public async putTiddler(tiddler: IFullTiddler): Promise<API_Result> {
        if (!tiddler.title || tiddler.title === "") {
            console.error("putTiddler() :: tiddler", tiddler);
            throw new Error(
                "API :: putTiddler() :: You must include a title in the tiddler."
            );
        }
        const conf = await this.configStorage.getAll();
        let response;
        const uriTitle = encodeURIComponent(tiddler.title);
        let url = this.joinURL(
            conf[EConfigKey.SERVER_URL],
            ENDPOINTS.PUT_TIDDLER
        );
        url = this.joinURL(url, uriTitle);
        try {
            response = await superagent
                .put(url)
                .send(tiddler)
                .auth(
                    conf[EConfigKey.SERVER_USERNAME],
                    conf[EConfigKey.SERVER_PASSWORD]
                )
                .type("json")
                .set("Accept", "application/json")
                .set("X-Requested-With", "TiddlyWiki");
        } catch (err) {
            return {
                ok: false,
                message:
                    "Failed to connect. Check the URL. Make sure you include http:// or https://.",
            };
        }

        if (!response.ok) {
            return {
                ok: false,
                message:
                    "Failed to connect to that server. Check the URL. Make sure you include http:// or https://.",
                response,
            };
        }

        return { ok: true };
    }
    /**
     * Get the /status of the server
     */
    public async getStatus(): Promise<API_Result> {
        const options = await this.configStorage.getAll();
        const url = this.joinURL(
            options[EConfigKey.SERVER_URL],
            ENDPOINTS.STATUS
        );
        return await this.get(url);
    }

    public async getTiddler(tiddlerTitle: string): Promise<API_Result> {
        const serverURL = await this.configStorage.get(EConfigKey.SERVER_URL);
        const uriTiddlerTitle = encodeURIComponent(tiddlerTitle);
        let url = this.joinURL(serverURL, ENDPOINTS.GET_SINGLE_TIDDLER);
        url = this.joinURL(url, uriTiddlerTitle);

        return await this.get(url);
    }

    public async getAllTiddlers(): Promise<ITiddlerItem[]> {
        const serverURL = await this.configStorage.get(EConfigKey.SERVER_URL);
        let url = this.joinURL(serverURL, ENDPOINTS.GET_ALL);

        const res = await this.get(url);
        if (res.data && res.data.length > 0) {
            return <ITiddlerItem[]>res.data;
        }
        return [];
    }

    /**
     * Check if the server is up.
     *
     * If the server is not up, open the config tab.
     */
    public async isServerUp(): Promise<boolean> {
        if (await this.configStorage.isServerConfigured()) {
            const status = await this.getStatus();
            if (status.ok) {
                return true;
            }
        }

        return false;
    }
}

export default API;
