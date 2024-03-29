/**
 * Extend the base Actor document game.nullgame
 * @extends {Actor}
 */
export class NullGameActor extends Actor {
  /** @override */
  prepareData () {
    super.prepareData();
  }

  /** @override */
  prepareDerivedData () {
    const actorData = this;
    const flags = actorData.flags.nullgame || {};
  }

  /** @override */
  getRollData () {
    return { ...super.getRollData(), ...this.system.getRollData?.() ?? null }
  }
}
