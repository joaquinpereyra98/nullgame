/**
 * Extend the base Actor document game.nullgame
 * @extends {Actor}
 */
export class NullGameActor extends Actor {
  /** @override */
  prepareDerivedData() {
    const actorData = this;
    const flags = actorData.flags.nullgame || {};
  }

  /** @override */
  getRollData() {
    return { ...super.getRollData(), ...(this.system.getRollData?.() ?? null) };
  }
  async _preCreate(data, options, userId) {
    await super._preCreate(data, options, userId);

    const globalEffectsData = game.settings
      .get("nullgame", "AEGlobalConfig")
      .map((e) => ({
        name: game.i18n.localize(e.name),
        disabled: true,
        statuses: [e.id],
        icon: e.icon,
        origin: "Global Effect",
        "duration.rounds": undefined,
        flags: { nullgame: { global: e.id } },
        description: e.description
      }));

    const effects = [
      ...this.effects.map((e) => e.toObject()),
      ...globalEffectsData,
    ];
    this.updateSource({ effects, prototypeToken: {actorLink: true} });
  }
  async _preUpdate(changed, options, user) {
    if (changed.system?.size) {
      changed['prototypeToken']={height:changed.system.size,width:changed.system.size}
    }
    return super._preUpdate(changed,options,user)
  }
}
