import { NullGameActor } from './documents/actor.mjs';
import { NullGameActorSheet } from './sheets/actor-sheet.mjs';
import {NullGameActorData} from './data/actor-base.mjs';

Hooks.once('init', function () {
    game.nullgame = {
        NullGameActor,
    };
    CONFIG.Actor.documentClass = NullGameActor;

    CONFIG.Actor.dataModels = {
      character: NullGameActorData,
    }
    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet('null-game', NullGameActorSheet, {
    makeDefault: true,
    label: 'NULL_GAME.SheetLabels.Actor',
  });
});