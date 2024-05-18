import { NullGameActor } from './documents/actor.mjs';
import { NullGameActorSheet } from './sheets/actor-sheet.mjs';
import NullGameActorData from './data/actor-base.mjs';
import { NullGameItem } from './documents/item.mjs';
import { NullGameItemSheet } from './sheets/item-sheet.mjs';
import NullGameFeatureData from './data/item-feature.mjs';
import NullGameSkillData from './data/item-skill.mjs';
import AbilityTemplate from './utils/measuredTemplate.mjs';
import { NullGameActiveEffect } from './documents/activeEffect.mjs';
import { NullGameActiveEffectConfig } from './sheets/activeEffect-sheet.mjs';
import { NullGameToken } from './utils/token.mjs';
async function preloadHandlebarsTemplates () {
  return loadTemplates([
    'systems/nullgame/templates/actor/tabs/feature-tab.hbs',
    'systems/nullgame/templates/actor/tabs/skills-tab.hbs',
    'systems/nullgame/templates/actor/tabs/effects-tab.hbs',
    'systems/nullgame/templates/item/tabs/description-tab.hbs',
    'systems/nullgame/templates/item/tabs/details-tab.hbs'
  ]);
};

Hooks.once('init', function () {
    game.nullgame = {
        NullGameActor,
        NullGameItem,
    };
    CONFIG.Actor.documentClass = NullGameActor;
    CONFIG.Item.documentClass = NullGameItem;
    CONFIG.ActiveEffect.documentClass = NullGameActiveEffect;
    
    CONFIG.Actor.dataModels = {
      character: NullGameActorData,
    }
    CONFIG.Item.dataModels = {
      feature: NullGameFeatureData,
      skill: NullGameSkillData
    }
    CONFIG.Token.objectClass = NullGameToken;
    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet('null-game', NullGameActorSheet, {
    makeDefault: true,
    label: 'NULL_GAME.SheetLabels.Actor',
  });
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('null-game', NullGameItemSheet, {
    makeDefault: true,
    label: 'NULL_GAME.SheetLabels.Item',
  });
  DocumentSheetConfig.unregisterSheet(ActiveEffect, "core", ActiveEffectConfig);
  DocumentSheetConfig.registerSheet(
    ActiveEffect,
    "null-game",
    NullGameActiveEffectConfig
  );
  preloadHandlebarsTemplates();
});
Hooks.on('renderChatMessage', (msg, html, msgData) => {
  html.on('click','.roll-damage-chat', (ev) => {
    const formula = ev.currentTarget.dataset.dmgformula;
    const roll = new Roll(formula);
     roll.toMessage({
      speaker: msg.speaker,
      flavor: msg.flavor,
      rollMode: game.settings.get("core", "rollMode"),
    })
  });

  html.on('click', '.create-measured-template', async (ev) => {
    const { itemid } = ev.currentTarget.dataset;
    const item = game.actors.get(msg.speaker.actor).items.get(itemid);
    if(item.hasAreaTarget){
      await (AbilityTemplate.fromItem(item))?.drawPreview();
    }
  });
});
Hooks.on("renderTokenHUD", function(tokenHud, html) {
	console.log(tokenHud, html);
});
