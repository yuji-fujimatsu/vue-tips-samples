import { BaseFormItem } from './BaseFormItem';

export class BaseForm {
  constructor() {
    this.invalid = false;
    this._items = {};
    return this;
  }

  get items() {
    return this._items;
  }

  addItem(name, item) {
    if (item instanceof BaseFormItem === false) {
      throw new Error(
        '[BaseForm] Item must be an instance of the extended BaseFormItem class',
      );
    }
    this._items[name] = item;
    this._items[name].addInvalidObserver(invalid => {
      this._updateState(invalid);
    });
    this.updateState();
    return this;
  }

  addRelationshipValidator({ names, validator, message }) {
    names.filter(name => name in this._items === false).forEach(name => {
      throw new Error(`[BaseForm] ${name} is not set item`);
    });
    names.forEach(name => {
      this._items[name].addValueObserver(() => {
        if (validator.call(this)) {
          this._removeMessages(names, message);
        } else {
          this._addMessages(names, message);
        }
      });
    });
    return this;
  }

  _addMessages(names, message) {
    names.forEach(name => {
      this._items[name].addMessage(message);
    });
  }

  _removeMessages(names, message) {
    names.forEach(name => {
      this._items[name].removeMessage(message);
    });
  }

  setValues(newValues) {
    Object.entries(newValues).forEach(([name, value]) => {
      this._items[name].value = value;
    });
  }

  values() {
    return Object.entries(this._items).reduce((values, [name, item]) => {
      values[name] = item.value;
      return values;
    }, {});
  }

  updateState() {
    this.invalid = this._invalidResults();
    return this;
  }

  _updateState(invalid) {
    if (invalid === false) {
      this.invalid = this._invalidResults();
    } else {
      this.invalid = true;
    }
  }

  _invalidResults() {
    return Object.keys(this._items).some(name => this._items[name].invalid);
  }
}
