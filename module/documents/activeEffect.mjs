export class NullGameActiveEffect extends ActiveEffect {
  get counter(){
    return this.getFlag('nullgame', 'counter') ||  0;
  }
  set counter(val){
    this.setFlag('nullgame', 'counter', val);
  }
}
