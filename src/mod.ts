import { DependencyContainer } from "tsyringe";

import { ILogger } from "@spt/models/spt/utils/ILogger";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import { LogBackgroundColor } from "@spt/models/spt/logging/LogBackgroundColor";

class Mod implements IPostDBLoadMod
{    
    private modConfig = require("../config/config.json")

    public postDBLoad(container: DependencyContainer): void
    {
        const logger = container.resolve<ILogger>("WinstonLogger");

        if (!this.modConfig.modEnabled)
        {
            // log that mod is loaded, but is not enabled in the config
            if (this.modConfig.modDebug == true)
            {
                logger.logWithColor("[DEBUG] [SCHKRM] (PostDB) Basic Flea Changer loaded, but mod is disabled in the config.", LogTextColor.BLUE, LogBackgroundColor.YELLOW)
            }
            else
            {
                logger.logWithColor("[SCHKRM] Basic Flea Changer loaded, but mod is disabled in the config.", LogTextColor.BLACK, LogBackgroundColor.YELLOW)
            }
            return;
        }

        // get database from the server
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");

        // get all the in-memory json foudn in /assets/database
        const tables: IDatabaseTables = databaseServer.getTables();

        // change flea options

        // option for enable the flea market
        tables.globals.config.RagFair.enabled = this.modConfig.configOptions.fleaEnabled;

        // option for setting min level for flea access
        tables.globals.config.RagFair.minUserLevel = this.modConfig.configOptions.fleaMinimumLevel;

        // option for forcing only FIR items to be sold on flea, rather than all items
        tables.globals.config.RagFair.isOnlyFoundInRaidAllowed = this.modConfig.configOptions.fleaSellingFIROnly;

        // log it if debug is enabled
        if (this.modConfig.modDebug == true)
        {
            console.log("[DEBUG] [SCHKRM] Basic Flea Changer - Flea Market status set to:",this.modConfig.configOptions.fleaEnabled)
            console.log("[DEBUG] [SCHKRM] Basic Flea Changer - Flea Market Min Level set to:",this.modConfig.configOptions.fleaMinimumLevel)
            console.log("[DEBUG] [SCHKRM] Basic Flea Changer - Flea Market only accepts FIR items set to:",this.modConfig.configOptions.fleaSellingFIROnly)
        }
        
        logger.logWithColor("[SCHKRM] Basic Flea Changer loaded.", LogTextColor.BLACK, LogBackgroundColor.YELLOW);
    }
}

export const mod = new Mod();

