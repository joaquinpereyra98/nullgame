/**
 * Extend the base Actor class to implement additional system-specific logic.
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