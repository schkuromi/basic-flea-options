import { DependencyContainer } from "tsyringe";

import { ILogger } from "@spt/models/spt/utils/ILogger";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { IRagfairConfig } from "@spt/models/spt/config/IRagfairConfig";
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
                logger.logWithColor("[DEBUG] [SCHKRM] (PostDB) Basic Flea Options loaded, but mod is disabled in the config.", LogTextColor.BLUE, LogBackgroundColor.YELLOW)
            }
            else
            {
                logger.logWithColor("[SCHKRM] Basic Flea Options loaded, but mod is disabled in the config.", LogTextColor.BLACK, LogBackgroundColor.YELLOW)
            }
            return;
        }

        // get the config server so we can get a config with it
        const configServer = container.resolve<ConfigServer>("ConfigServer");

        // Request flea config
        const fleaConfig: IRagfairConfig = configServer.getConfig<IRagfairConfig>(ConfigTypes.RAGFAIR);

        // all the flea configs
        fleaConfig.dynamic.purchasesAreFoundInRaid = this.modConfig.configOptions.fleaItemsBoughtIsFIR;
        fleaConfig.dynamic.offerItemCount.min = this.modConfig.configOptions.fleaItemCountMin;
        fleaConfig.dynamic.offerItemCount.max = this.modConfig.configOptions.fleaItemCountMax;
        fleaConfig.dynamic.removeSeasonalItemsWhenNotInEvent = !this.modConfig.configOptions.fleaAlwaysShowSeasonalItems;
        fleaConfig.dynamic.blacklist.enableBsgList = this.modConfig.configOptions.fleaEnableBsgBlacklist;
        fleaConfig.dynamic.blacklist.enableQuestList = this.modConfig.configOptions.fleaEnableQuestItemsBlacklist;

        fleaConfig.dynamic.barter.chancePercent = this.modConfig.configOptions.fleaBarterPercent;
        fleaConfig.dynamic.barter.itemCountMin = this.modConfig.configOptions.fleaBarterCountMin;
        fleaConfig.dynamic.barter.itemCountMax = this.modConfig.configOptions.fleaBarterCountMax;
        fleaConfig.dynamic.barter.minRoubleCostToBecomeBarter = this.modConfig.configOptions.fleaMinRoubleCostToBecomeBarter;

        fleaConfig.dynamic.pack.chancePercent = this.modConfig.configOptions.fleaPackPercent;
        fleaConfig.dynamic.pack.itemCountMin = this.modConfig.configOptions.fleaPackCountMin;
        fleaConfig.dynamic.pack.itemCountMax = this.modConfig.configOptions.fleaPackCountMax;
        
        // get database from the server
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");

        // get all the in-memory json foudn in /assets/database
        const tables: IDatabaseTables = databaseServer.getTables();

        // change database flea options

        // option for enable the flea market
        tables.globals.config.RagFair.enabled = this.modConfig.configOptions.fleaEnabled;

        // option for setting min level for flea access
        tables.globals.config.RagFair.minUserLevel = this.modConfig.configOptions.fleaMinimumLevel;

        // option for forcing only FIR items to be sold on flea, rather than all items
        tables.globals.config.RagFair.isOnlyFoundInRaidAllowed = this.modConfig.configOptions.fleaSellingFIROnly;

        // option for removing item selling limits
        if (this.modConfig.configOptions.fleaDisableItemRestrictions)
        {
            tables.globals.config.RagFair.ItemRestrictions = [];
        }

        // log it if debug is enabled
        if (this.modConfig.modDebug == true)
        {
            console.log("[DEBUG] [SCHKRM] Basic Flea Options - Items bought from Flea is FIR:", fleaConfig.dynamic.purchasesAreFoundInRaid)
            console.log("[DEBUG] [SCHKRM] Basic Flea Options - Flea market minimum offers per item:", fleaConfig.dynamic.offerItemCount.min)
            console.log("[DEBUG] [SCHKRM] Basic Flea Options - Flea market maximum offers per item:", fleaConfig.dynamic.offerItemCount.max)
            if (this.modConfig.configOptions.fleaDisableItemRestrictions)
            {
                console.log("[DEBUG] [SCHKRM] Basic Flea Options - Flea market sell limit restrictions set to disabled in mod config.")
            }
            else
            {
                console.log("[DEBUG] [SCHKRM] Basic Flea Options - Flea market sell limit restrictions unchanged.")
            }

            console.log("[DEBUG] [SCHKRM] Basic Flea Options - Flea market barter offers percent chance:", fleaConfig.dynamic.barter.chancePercent)
            console.log("[DEBUG] [SCHKRM] Basic Flea Options - Flea market barter minimum offers per item:", fleaConfig.dynamic.barter.itemCountMin)
            console.log("[DEBUG] [SCHKRM] Basic Flea Options - Flea market barter maximum offers per item:", fleaConfig.dynamic.barter.itemCountMax)
            console.log("[DEBUG] [SCHKRM] Basic Flea Options - Flea market barter minimum rouble cost to become a barter:", fleaConfig.dynamic.barter.minRoubleCostToBecomeBarter)

            console.log("[DEBUG] [SCHKRM] Basic Flea Options - Flea market hides seasonal items when that event is not running:", fleaConfig.dynamic.removeSeasonalItemsWhenNotInEvent)
            console.log("[DEBUG] [SCHKRM] Basic Flea Options - Flea market hides BSG blacklisted items:", fleaConfig.dynamic.blacklist.enableBsgList)
            console.log("[DEBUG] [SCHKRM] Basic Flea Options - Flea market hides Quest items:", fleaConfig.dynamic.blacklist.enableQuestList)
            console.log("[DEBUG] [SCHKRM] Basic Flea Options - Flea market item packs offers percent chance:", fleaConfig.dynamic.pack.chancePercent)
            console.log("[DEBUG] [SCHKRM] Basic Flea Options - Flea market item packs offers minimum offers per item:", fleaConfig.dynamic.pack.itemCountMin)
            console.log("[DEBUG] [SCHKRM] Basic Flea Options - Flea market item packs offers maximum offers per item:", fleaConfig.dynamic.pack.itemCountMax)

            console.log("[DEBUG] [SCHKRM] Basic Flea Options - Flea market button works:", this.modConfig.configOptions.fleaEnabled)
            console.log("[DEBUG] [SCHKRM] Basic Flea Options - Flea market minimum user level set to:", this.modConfig.configOptions.fleaMinimumLevel)
            console.log("[DEBUG] [SCHKRM] Basic Flea Options - Flea market only accepts FIR items set to:", this.modConfig.configOptions.fleaSellingFIROnly)
        }

        logger.logWithColor("[SCHKRM] Basic Flea Options loaded.", LogTextColor.BLACK, LogBackgroundColor.YELLOW);
    }
}

export const mod = new Mod();
