/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list (alphabetical ordering) of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.


 - Kasweka Michael Mukoko <kaswekamukoko@gmail.com>

 --------------
 ******/

import { thirdparty } from "@mojaloop/api-snippets";
import { IHTTPClient, ILogger } from "../interfaces";
import { AirtelError } from "./errors";
import { IAirtelClient, TAirtelConfig, TAirtelKycResponse, TGetKycArgs, TGetTokenArgs, TGetTokenResponse } from "./types";

export const ROUTES = Object.freeze({
    getToken: '/auth/oauth2/token',
    getKyc: '/standard/v2/users/',

});



export class AirtelClient implements IAirtelClient {
    airtelConfig: TAirtelConfig;
    httpClient: IHTTPClient;
    logger: ILogger;

    constructor(airtelConfig: TAirtelConfig, httpClient: IHTTPClient, logger: ILogger) {
        this.airtelConfig = airtelConfig;
        this.httpClient = httpClient;
        this.logger = logger;
    }


    async getToken(deps: TGetTokenArgs): Promise<TGetTokenResponse> {
        this.logger.info("Getting Access Token from Airtel");
        const res = await this.httpClient.post<TGetTokenArgs, TGetTokenResponse>(`https://${this.airtelConfig.AIRTEL_BASE_URL}${ROUTES.getToken}`, deps, {
            headers : this.getDefaultHeader()
        });
        if (res.statusCode !== 200) {
            throw AirtelError.getTokenFailedError();
        }
        return res.data;
    }


    async getKyc(deps: TGetKycArgs): Promise<TAirtelKycResponse> {
        this.logger.info("Getting KYC Information");
        const res = await this.httpClient.get<TAirtelKycResponse>(`https://${this.airtelConfig.AIRTEL_BASE_URL}${ROUTES.getKyc}${deps.msisdn}`, {
            headers :{
                ...this.getDefaultHeader(),
                'Authorization': `Bearer ${await this.getAuthHeader()}`
            } 
        })
        if (res.statusCode !== 200) {
            throw AirtelError.getKycError();
        }
        return res.data;
    }

    private getDefaultHeader(){
        return {
        'Accept': 'application/json',
        'X-Country': this.airtelConfig.X_COUNTRY,
        'X-Currency': this.airtelConfig.X_CURRENCY,
      }
    }


    private async getAuthHeader(): Promise<string>{
        const res = await this.getToken({
            clientSecret: this.airtelConfig.CLIENT_SECRET,
            clientId: this.airtelConfig.CLIENT_ID,
            grantType: this.airtelConfig.GRANT_TYPE
        });
      return res.access_token;
    } 






}