export class NullGameToken extends Token {
  async drawEffects() {
    const wasVisible = this.effects.visible;
    this.effects.visible = false;
    this.effects.removeChildren().forEach((c) => c.destroy());
    this.effects.bg = this.effects.addChild(new PIXI.Graphics());
    this.effects.bg.visible = false;
    this.effects.overlay = null;

    // Categorize new effects
    const tokenEffects = this.document.effects;
    const actorEffects = this.actor?.temporaryEffects || [];
    let overlay = {
      src: this.document.overlayEffect,
      tint: null,
    };
    // Draw status effects
    if (tokenEffects.length || actorEffects.length) {
      const promises = [];

      // Draw actor effects first
      for (let f of actorEffects) {
        if (!f.icon) continue;
        const tint = Color.from(f.tint ?? null);
        if (f.getFlag("core", "overlay")) {
          if (overlay)
            promises.push(this._drawEffect(overlay.src, overlay.tint));
          overlay = { src: f.icon, tint };
          continue;
        }
        promises.push(this._drawEffect(f.icon, tint, f._id));
      }

      // Next draw token effects
      for (let f of tokenEffects) promises.push(this._drawEffect(f, null));
      await Promise.all(promises);
    }
    // Draw overlay effect
    this.effects.overlay = await this._drawOverlay(overlay.src, overlay.tint);
    this.effects.bg.visible = true;
    this.effects.visible = wasVisible;
    this._refreshEffects();

    //Add Counter Text
    if (this.effectCounters) {
      this.effectCounters.removeChildren().forEach((c) => c.destroy());
    }
    if (!this.children.find((c) => c.name === "effectCounters")) {
      const counterContainer = new PIXI.Container();
      counterContainer.name = "effectCounters";
      this.effectCounters = this.addChild(counterContainer);
    }
    for (let sprite of this.effects.children.filter(effect => effect.isSprite && effect.id)) {
      const eff = actorEffects.find(effect => sprite.id === effect._id);
      if (eff) this.effectCounters.addChild(createEffectCounter(eff.counter, sprite)); 
  }
  }
  async _drawEffect(src, tint, ID) {
    if (!src) return;
    let tex = await loadTexture(src, { fallback: "icons/svg/hazard.svg" });
    let icon = new PIXI.Sprite(tex);
    if (tint) icon.tint = tint;
    this.effects.addChild(icon);
    icon.name = src;
    if(ID) icon.id = ID;
    return icon;
  }

}
function createEffectCounter(cnt, icon) {
  const style = new PIXI.TextStyle({
    fontFamily: "Signika",
    fontSize: 18,
    fill: "red",
    stroke: "#111111",
    strokeThickness: 1,
    align: "center",
    wordWrap: false,
    padding: 1
  });

  const text = new PIXI.Text(cnt, style);
  text.anchor.set(1);

  const ratio = icon.height / 20;
  text.x = icon.x + icon.width + ratio;
  text.y = icon.y + icon.height + 3 * ratio;
  text.resolution = Math.max(1, (1 / ratio) * 1.5);

  return text;
}

