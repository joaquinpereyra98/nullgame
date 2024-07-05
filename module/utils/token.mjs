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
    const actorEffects = this.actor?.appliedEffects || [];
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
    for (let sprite of this.effects.children.filter(
      (effect) => effect.isSprite && effect.id
    )) {
      const eff = actorEffects.find((effect) => sprite.id === effect._id);
      if (eff && eff.counter !== 0)
        this.effectCounters.addChild(createEffectCounter(eff.counter, sprite));
    }
  }
  async _drawEffect(src, tint, ID) {
    if (!src) return;
    let tex = await loadTexture(src, { fallback: "icons/svg/hazard.svg" });
    let icon = new PIXI.Sprite(tex);
    if (tint) icon.tint = tint;
    this.effects.addChild(icon);
    if (ID) icon.id = ID;
    return icon;
  }
  async _draw() {
    this.bars = this.addChild(this.#drawAttributeBars());
    await super._draw();
  }
  #drawAttributeBars() {
    const bars = new PIXI.Container();
    bars.bar1 = bars.addChild(new PIXI.Graphics());
    bars.bar2 = bars.addChild(new PIXI.Graphics());
    bars.bar3 = bars.addChild(new PIXI.Graphics());
    return bars;
  }
  drawBars() {
    if (
      !this.actor ||
      this.document.displayBars === CONST.TOKEN_DISPLAY_MODES.NONE
    )
      return;
    ["bar1", "bar2", "bar3"].forEach((b, i) => {
      const bar = this.bars[b];
      let attr = this.document.getBarAttribute(b);
      if (!attr || attr.type !== "bar" || attr.max === 0)
        return (bar.visible = false);
      this._drawBar(i, bar, attr);
      bar.visible = true;
    });
  }
  _drawBar(number, bar, data) {
    const val = Number(data.value);
    const pct = Math.clamped(val, 0, data.max) / data.max;

    // Determine sizing
    let h = Math.max(canvas.dimensions.size / 12, 8);
    const w = this.w;
    const bs = Math.clamped(h / 8, 1, 2);
    if (this.document.height >= 2) h *= 1.6; // Enlarge the bar for large tokens

    // Determine the color to use
    const blk = 0x000000;
    let color;
    let posY;
    switch (number) {
      case 0:
        color = Color.fromRGB([1 - pct / 2, pct, 0]);
        posY = this.h - h;
        break;
      case 1:
        color = Color.fromRGB([0.5 * pct, 0.7 * pct, 0.5 + pct / 2]);
        posY = 0;
        break;
      default:
        color = Color.fromRGB([0.2 + 0.8 * pct, 0.2 + 0.8 * pct, 0]);
        posY = h;
        break;
    }
    // Draw the bar
    bar.clear();
    bar
      .beginFill(blk, 0.5)
      .lineStyle(bs, blk, 1.0)
      .drawRoundedRect(0, 0, this.w, h, 3);
    bar
      .beginFill(color, 1.0)
      .lineStyle(bs, blk, 1.0)
      .drawRoundedRect(0, 0, pct * w, h, 2);

    // Set position
    bar.position.set(0, posY);
    return true;
  }
  _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);
    data.flags.nullgame = {
      bar3: {
        attribute: null,
      },
    };
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
    padding: 1,
  });

  const text = new PIXI.Text(cnt, style);
  text.anchor.set(1);

  const ratio = icon.height / 20;
  text.x = icon.x + icon.width + ratio;
  text.y = icon.y + icon.height + 3 * ratio;
  text.resolution = Math.max(1, (1 / ratio) * 1.5);

  return text;
}
export function onRenderHud(tokenHud, html, tokenData) {
  const stsEff = html.find(".status-effects");
    for (const child of stsEff.children()) {
      child.remove()
    }
  const newEffects = tokenHud.object.actor.effects;
  const newEffectsIcons = newEffects
    .map(
      (effect) =>
        `<img class="effect-control active" src="${effect.icon}" data-status-id="${effect.id}" data-tooltip="${effect.name}: ${effect.description}</p>"/>`
    )
    .join("");

  stsEff.append(newEffectsIcons);
  stsEff.off("click", ".effect-control");
  stsEff.on("click", ".effect-control", onClickEffect.bind(tokenHud));

  stsEff.off("contextmenu", ".effect-control");
  stsEff.on(
    "contextmenu",
    ".effect-control",
    onRightClickEffect.bind(tokenHud)
  );
  const bar3 = tokenHud.object.document.getBarAttribute("bar3");
  if (bar3 && bar3.type !== "none") {
    const divAttr = html.find(".attribute.bar2");
    divAttr.append(
      `<input class="bar3" type="text" name="bar3.value" data-bar="bar3" value="${
        bar3.value
      }" ${bar3.editable ? "" : "disabled"}>`
    );
    divAttr.on("click", ".bar3", tokenHud._onAttributeClick);
    divAttr.on("keydown", ".bar3", tokenHud._onAttributeKeydown.bind(tokenHud));
    divAttr.on("focusout", ".bar3", (event) => {
      event.preventDefault();
      if (!tokenHud.object) return;

      // Acquire string input
      const input = event.currentTarget;
      let strVal = input.value.trim();
      let isDelta = strVal.startsWith("+") || strVal.startsWith("-");
      if (strVal.startsWith("=")) strVal = strVal.slice(1);
      let value = Number(strVal);

      const bar = input.dataset.bar;
      const actor = tokenHud.object?.actor;
      if (bar && actor) {
        const attr = tokenHud.object.document.getBarAttribute(bar);
        if (isDelta || attr.attribute !== value) {
          actor.modifyTokenAttribute(
            attr.attribute,
            value,
            isDelta,
            attr.type === "bar"
          );
        }
      }

      // Otherwise update the Token directly
      else {
        const current = foundry.utils.getProperty(
          tokenHud.object.document,
          input.name
        );
        tokenHud.object.document.update({
          [input.name]: isDelta ? current + value : value,
        });
      }
    });
  }
  const tooltip = canvas.hud.effectTooltipHover;
  if (tooltip === undefined) return;
  if (tokenHud.object.hover) {
    tooltip.clear();
    tooltip.bind(tokenHud.object)
  }
}
function onClickEffect(ev) {
  ev.stopPropagation();
  const actor = this.object.actor;
  const efID = ev.currentTarget.dataset.statusId;
  const effect =
    actor.effects.find((ef) => ef.getFlag("nullgame", "global") === efID) ??
    actor.effects.find((ef) => ef.id === efID);

  if (!effect) return;

  if (ev.shiftKey) {
    effect.update({ disabled: !effect.disabled });
  } else {
    if (effect.disabled) {
      effect.update({ disabled: false });
    }
    effect.counter++;
  }
}

async function onRightClickEffect(ev) {
  const actor = this.object.actor;
  const efID = ev.currentTarget.dataset.statusId;
  const effect =
    actor.effects.find((ef) => ef.getFlag("nullgame", "global") === efID) ??
    actor.effects.find((ef) => ef.id === efID);

  if (!effect) return;

  if (ev.shiftKey) {
    await new Dialog({
      title: game.i18n.localize("statuscounter.stackInput.title"), //TODO localize
      content: `
        <p>Insert ${effect.name} Counter:</p>
        <p><input type="number" name="counter" value="${effect.counter}"/></p>`,
      buttons: {
        ok: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("statuscounter.stackInput.button"),
          callback: (html) =>
            (effect.counter = html[0].querySelector(
              "input[name='counter']"
            ).valueAsNumber),
        },
      },
      default: "ok",
    }).render(true);
  } else {
    effect.counter--;
  }
}
