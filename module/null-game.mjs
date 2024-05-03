import { NullGameActor } from './documents/actor.mjs';
import { NullGameActorSheet } from './sheets/actor-sheet.mjs';
import NullGameActorData from './data/actor-base.mjs';
import { NullGameItem } from './documents/item.mjs';
import { NullGameItemSheet } from './sheets/item-sheet.mjs';
import NullGameFeatureData from './data/item-feature.mjs';
import NullGameSkillData from './data/item-skill.mjs';

async function preloadHandlebarsTemplates () {
  return loadTemplates([
    'systems/nullgame/templates/actor/tabs/feature-tab.hbs',
    'systems/nullgame/templates/actor/tabs/skills-tab.hbs',
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

    CONFIG.Actor.dataModels = {
      character: NullGameActorData,
    }
    CONFIG.Item.dataModels = {
      feature: NullGameFeatureData,
      skill: NullGameSkillData
    }
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
  preloadHandlebarsTemplates();
});