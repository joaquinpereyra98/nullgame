import { NullGameActor } from "./documents/actor.mjs";
import { NullGameActorSheet } from "./sheets/actor-sheet.mjs";
import NullGameActorData from "./data/actor-base.mjs";
import NullGameNPCData from "./data/actor-npc.mjs";
import { NullGameItem } from "./documents/item.mjs";
import { NullGameItemSheet } from "./sheets/item-sheet.mjs";
import NullGameFeatureData from "./data/item-feature.mjs";
import NullGameSkillData from "./data/item-skill.mjs";
import AbilityTemplate from "./utils/measuredTemplate.mjs";
import { NullGameActiveEffect } from "./documents/activeEffect.mjs";
import { NullGameActiveEffectConfig } from "./sheets/activeEffect-sheet.mjs";
import { NullGameToken, onRenderHud } from "./utils/token.mjs";
import { NullGameTokenDocument } from "./documents/token.mjs";
import { NullGameTokenConfig } from "./sheets/token-config.mjs";
import { registerSystemSettings } from "./utils/setting.mjs";
import { EffectTooltipHUD } from "./effectTooltipHUD.mjs";
async function preloadHandlebarsTemplates() {
  return loadTemplates([
    "systems/nullgame/templates/actor/tabs/feature-tab.hbs",
    "systems/nullgame/templates/actor/tabs/skills-tab.hbs",
    "systems/nullgame/templates/actor/tabs/effects-tab.hbs",
    "systems/nullgame/templates/item/tabs/description-tab.hbs",
    "systems/nullgame/templates/item/tabs/details-tab.hbs",
  ]);
}

Hooks.once("init", function () {
  game.nullgame = {
    NullGameActor,
    NullGameItem,
  };
  CONFIG.Actor.documentClass = NullGameActor;
  CONFIG.Item.documentClass = NullGameItem;
  CONFIG.ActiveEffect.documentClass = NullGameActiveEffect;

  CONFIG.Actor.dataModels = {
    character: NullGameActorData,
    npc: NullGameNPCData,
  };
  CONFIG.Item.dataModels = {
    feature: NullGameFeatureData,
    skill: NullGameSkillData,
  };
  CONFIG.Token.objectClass = NullGameToken;
  CONFIG.Token.documentClass = NullGameTokenDocument;
  CONFIG.Token.prototypeSheetClass = NullGameTokenConfig;
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("null-game", NullGameActorSheet, {
    makeDefault: true,
    label: "NULL_GAME.SheetLabels.Actor",
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("null-game", NullGameItemSheet, {
    makeDefault: true,
    label: "NULL_GAME.SheetLabels.Item",
  });

  DocumentSheetConfig.unregisterSheet(ActiveEffect, "core", ActiveEffectConfig);
  DocumentSheetConfig.registerSheet(
    ActiveEffect,
    "null-game",
    NullGameActiveEffectConfig
  );
  DocumentSheetConfig.unregisterSheet(TokenDocument, "core", TokenConfig);
  DocumentSheetConfig.registerSheet(
    TokenDocument,
    "null-game",
    NullGameTokenConfig,
    {
      makeDefault: true
    }
  )

  // Preload templates and register system settings
  preloadHandlebarsTemplates();
  registerSystemSettings();
  CONFIG.statusEffects = foundry.utils.deepClone(
    game.settings.get("nullgame", "AEGlobalConfig")
  );
});
Hooks.on("renderChatMessage", (msg, html, msgData) => {
  html.on("click", ".roll-damage-chat", (ev) => {
    const formula = ev.currentTarget.dataset.dmgformula;
    const roll = new Roll(formula);
    roll.toMessage({
      speaker: msg.speaker,
      flavor: msg.flavor,
      rollMode: game.settings.get("core", "rollMode"),
    });
  });

  html.on("click", ".create-measured-template", async (ev) => {
    const { itemid } = ev.currentTarget.dataset;
    const item = game.actors.get(msg.speaker.actor).items.get(itemid);
    if (item.hasAreaTarget) {
      await AbilityTemplate.fromItem(item)?.drawPreview();
    }
  });
});
Hooks.on("renderTokenHUD", onRenderHud);

Hooks.on("renderHeadsUpDisplay", (app, html, data) => {
  html.append(`<template id="effect-tooltip-hover"></template>`);
  canvas.hud.effectTooltipHover = new EffectTooltipHUD();
});
Hooks.on("hoverToken", (token, hovered) => {
  const tooltip = canvas.hud.effectTooltipHover;
  if (tooltip === undefined) return;
  if (!hovered || token !== canvas.tokens.hover) {
    tooltip.clear();
  } else {
    tooltip.bind(token);
  }
});
