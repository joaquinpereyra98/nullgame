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
        description: e.description,
      }));

    const effects = [
      ...this.effects.map((e) => e.toObject()),
      ...globalEffectsData,
    ];
    this.updateSource({ effects, prototypeToken: { actorLink: true } });
  }
  async _preUpdate(changed, options, user) {
    const size = changed.system?.size;
    if (size >= 0) {
      changed["prototypeToken"] = {
        height: changed.system.size,
        width: changed.system.size,
      };
      const tokens = this.getActiveTokens(false, true);
      tokens?.forEach(
        async (t) => await t.update({ height: size, width: size })
      );
    }
    const category = changed.system?.categories?.features;
    if (category) {
      for (const [oldKey, newKey] of Object.entries(category)) {
        if (newKey === "") continue;
        category[newKey] = category[oldKey];
        category[oldKey] = "";
        changed.items = this.itemTypes.feature
          .filter((i) => i.system.category === oldKey)
          .map((i) => ({
            _id: i._id,
            "system.category": newKey,
          }));
      }
    }
    return super._preUpdate(changed, options, user);
  }
}
